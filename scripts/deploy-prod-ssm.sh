#!/usr/bin/env bash
# Deploy BulkSkart frontend to production via S3 + AWS SSM (no SSH required).
# Works from Claude Code cloud, GitHub Actions, or a local machine with AWS CLI.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

AWS_REGION="${AWS_REGION:-ap-south-1}"
INSTANCE_ID="${INSTANCE_ID:-i-05439223085603d42}"
DEPLOY_BUCKET="${DEPLOY_BUCKET:-bulkskart-deploy-prod}"
DEPLOY_PREFIX="${DEPLOY_PREFIX:-frontend/dist}"
export AWS_REGION INSTANCE_ID

AWS_ARGS=(--region "$AWS_REGION")
if [[ -n "${AWS_PROFILE:-}" ]]; then
  AWS_ARGS+=(--profile "$AWS_PROFILE")
fi

aws_cli() {
  aws "${AWS_ARGS[@]}" "$@"
}

wait_ssm() {
  local cmd_id="$1"
  local status=""
  local i
  for i in $(seq 1 60); do
    status="$(aws_cli ssm get-command-invocation --command-id "$cmd_id" --instance-id "$INSTANCE_ID" --query Status --output text 2>/dev/null || true)"
    case "$status" in
      Success|Cancelled|TimedOut|Failed) echo "$status"; return 0 ;;
    esac
    sleep 2
  done
  echo "${status:-Unknown}"
}

echo "==> Verifying AWS identity"
aws_cli sts get-caller-identity >/dev/null

echo "==> Reading production ANON_KEY via SSM"
ANON_CMD_ID="$(aws_cli ssm send-command \
  --instance-ids "$INSTANCE_ID" \
  --document-name AWS-RunShellScript \
  --comment "bulkskart-read-anon-key" \
  --parameters commands='["grep ^ANON_KEY= /opt/bulkskart/stack/.env | cut -d= -f2-"]' \
  --timeout-seconds 60 \
  --query 'Command.CommandId' --output text)"

ANON_STATUS="$(wait_ssm "$ANON_CMD_ID")"
PROD_ANON="$(aws_cli ssm get-command-invocation --command-id "$ANON_CMD_ID" --instance-id "$INSTANCE_ID" --query StandardOutputContent --output text | tr -d '\r' | head -n1 | tr -d '\n')"
if [[ -z "$PROD_ANON" || "$PROD_ANON" == "None" || "$ANON_STATUS" != "Success" ]]; then
  echo "Failed to read ANON_KEY from production via SSM (status=$ANON_STATUS)" >&2
  exit 1
fi

export VITE_SUPABASE_URL="${VITE_SUPABASE_URL:-https://www.bulkskart.com}"
export VITE_SUPABASE_ANON_KEY="$PROD_ANON"
export VITE_GTM_ID="${VITE_GTM_ID:-GTM-T4HWCGKD}"
export VITE_APP_ID="${VITE_APP_ID:-app-egd29h5g4zcx}"

echo "==> Building frontend"
rm -rf dist
if command -v pnpm >/dev/null 2>&1 && [[ -f pnpm-lock.yaml ]]; then
  pnpm install --frozen-lockfile
  pnpm exec vite build --outDir dist --logLevel error
else
  npm install --no-fund --no-audit
  npx vite build --outDir dist --logLevel error
fi
test -f dist/index.html

STAMP="$(date -u +%Y%m%dT%H%M%SZ)-$(git rev-parse --short HEAD 2>/dev/null || echo local)"
S3_URI="s3://${DEPLOY_BUCKET}/${DEPLOY_PREFIX}/${STAMP}"
echo "==> Uploading dist to ${S3_URI}"
aws_cli s3 sync dist/ "$S3_URI/" --delete --only-show-errors
aws_cli s3 sync dist/ "s3://${DEPLOY_BUCKET}/${DEPLOY_PREFIX}/latest/" --delete --only-show-errors

export APPLY_SCRIPT
APPLY_SCRIPT="$(cat <<EOF
bash -lc 'set -euo pipefail; export AWS_DEFAULT_REGION=${AWS_REGION}; TMP=\$(mktemp -d); aws s3 sync ${S3_URI}/ "\$TMP/" --delete --only-show-errors; test -f "\$TMP/index.html"; rsync -a --delete "\$TMP/" /opt/bulkskart/stack/frontend/dist/; docker restart bulkskart-web; rm -rf "\$TMP"; echo DEPLOY_OK ${STAMP}'
EOF
)"

echo "==> Applying release on EC2 via SSM"
APPLY_CMD_ID="$(
  python3 - <<'PY'
import json, os, subprocess
params = {"commands": [os.environ["APPLY_SCRIPT"]]}
cmd = [
  "aws", "ssm", "send-command",
  "--region", os.environ.get("AWS_REGION", "ap-south-1"),
  "--instance-ids", os.environ["INSTANCE_ID"],
  "--document-name", "AWS-RunShellScript",
  "--comment", "bulkskart-apply-frontend",
  "--parameters", json.dumps(params),
  "--timeout-seconds", "300",
  "--query", "Command.CommandId",
  "--output", "text",
]
profile = os.environ.get("AWS_PROFILE")
if profile:
  cmd[1:1] = ["--profile", profile]
print(subprocess.check_output(cmd, text=True).strip())
PY
)"

APPLY_STATUS="$(wait_ssm "$APPLY_CMD_ID")"
OUT="$(aws_cli ssm get-command-invocation --command-id "$APPLY_CMD_ID" --instance-id "$INSTANCE_ID" --query StandardOutputContent --output text)"
ERR="$(aws_cli ssm get-command-invocation --command-id "$APPLY_CMD_ID" --instance-id "$INSTANCE_ID" --query StandardErrorContent --output text)"
echo "$OUT"
if [[ -n "$ERR" && "$ERR" != "None" ]]; then
  echo "$ERR" >&2
fi
if [[ "$APPLY_STATUS" != "Success" ]]; then
  echo "SSM apply failed with status=$APPLY_STATUS" >&2
  exit 1
fi

echo "==> Checking live site"
HTTP_CODE="$(curl -sS -o /dev/null -w "%{http_code}" https://www.bulkskart.com/ || true)"
echo "live_http=${HTTP_CODE}"
if [[ "$HTTP_CODE" != "200" && "$HTTP_CODE" != "301" && "$HTTP_CODE" != "302" ]]; then
  echo "Warning: unexpected live HTTP status ${HTTP_CODE} (deploy itself succeeded)" >&2
fi
echo "Deploy complete: ${STAMP}"
