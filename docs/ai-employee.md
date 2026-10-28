# Bulkskart AI Employee (admin area)

Route: `/admin/ai-employee`

## What is built

A separate admin workspace inside the existing Vite + React + Supabase app. It has six tabs:

- **Overview**: KPI tiles for leads, qualification, outreach drafts, replies, interest, registration starts, registrations, and subscriptions.
- **Import**: paste public-source CSV. Every row needs a company, a country, and an https:// source URL. Rows missing these are rejected with a reason. Duplicates are skipped by website host or by normalized name within the same country. Accepted rows are unverified and session-only.
- **Lead Explorer**: search and filters (country, category, status, minimum score), lead detail with source and missing fields, duplicate review, and CSV export of the filtered rows.
- **Research**: queue, pause, resume, and cancel research jobs, with a lead cap from the campaign limit. Jobs stay in memory and do not run. No research provider is configured.
- **Outreach**: eligible leads, draft generation in English, Tamil, Hindi, Telugu, and Malayalam, an editable body, personalization sources, approve or reject, and Do Not Contact. Send is disabled.
- **Pipeline**: cumulative conversion funnel, leads by status, and follow-up tasks. Interested and registration-in-progress leads are high priority for a human.
- **Settings**: campaign lead limit, default outreach language, integration status, and a session audit log.

Files:

- `src/lib/aiEmployee/`: types, normalization and duplicate detection, scoring, outreach drafting, pipeline math, CSV export, and the demo flag
- `src/data/aiEmployee/sampleLeads.ts`: fictional sample records
- `src/components/ai-employee/AIEmployeeWorkspace.tsx`: all six tabs
- `src/pages/ai-employee/AIEmployeePage.tsx`: access gate and demo session controls
- `src/routes.tsx`: one lazy route entry
- `src/lib/aiEmployee/leadImport.ts`: CSV parser and import validation
- `src/__tests__/aiEmployee/`: 35 unit tests
- `.env.example`: `VITE_AI_EMPLOYEE_DEMO`

Nothing in the app's existing pages, auth code, or Supabase client was changed.

## Access model

| Build | `VITE_AI_EMPLOYEE_DEMO` | Behavior |
|---|---|---|
| Preview / demo | `true` | Opens with no login. Shows the "Preview / Demo Mode" banner, sample data only, and Disconnect / Reconnect controls. |
| Production | unset or any other value | Requires a signed-in user with `profile.role === 'admin'`. Everyone else is redirected to `/auth`. Shows no data. |

- The flag is read as a literal `import.meta.env` value, so production bundles fold it to `false`. Local verification found zero demo strings in the production bundle.
- The demo branch imports no Supabase or auth module and makes no network calls to the database.
- The production gate fails closed: it shows a loading state while auth resolves, then redirects to `/auth` unless there is a signed-in user with the admin role.
- Demo sessions keep disconnect state in `sessionStorage` only, as a per-viewer convenience.
- The flag is a build-time setting, not a data security boundary. Set it only in Preview environments.

### Required Preview build settings

The app's Supabase client throws at load time when `VITE_SUPABASE_URL` is missing, so the whole shell fails. A demo build must therefore set a non-production placeholder, so it cannot reach any real database:

```
VITE_AI_EMPLOYEE_DEMO=true
VITE_SUPABASE_URL=https://demo.invalid
VITE_SUPABASE_ANON_KEY=demo-placeholder
```

Do not set `VITE_AI_EMPLOYEE_DEMO` in the Production environment. Production keeps its real Supabase values.

## Data and database

Verified from the repository: the live app's database is the self-hosted Supabase Postgres in `deploy/bulkskart/`. Its migrations live in `supabase/migrations/`. The only database variables the app reads are `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Neon is not used.

- The live app's database is **Supabase**. The only database variables in the repo are `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, and migrations are in `supabase/migrations/`.
- The Neon project "Bulkskart ai" (`snowy-block-27941165`) is a separate project. It has tables such as `manufacturer_leads`, `research_jobs`, and `outreach_drafts`, and its `production` branch has no link to this repo. This work does not use it.
- **No migrations were run or added.** The demo reads and writes nothing.

### Proposed schema (not applied; needs your approval)

If you approve a live backend, these additive Supabase tables would back the workspace. All use `IF NOT EXISTS`, and none touch existing tables.

- `ai_manufacturer_leads`: `id`, `company_name`, `normalized_name`, `country`, `city`, `product_category`, `website_host` (unique with `country` when not null), `source_url`, `research_date`, `verification`, `confidence`, `research_notes`, `status` (checked against the 13 statuses), `created_at`, `updated_at`
- `ai_lead_sources`: `lead_id` FK, `url`, `fetched_at`, `evidence_excerpt`
- `ai_research_jobs`: `id`, `countries`, `categories`, `target`, `status`, `attempts`, `error`, `budget_cents`, timestamps
- `ai_outreach_drafts`: `lead_id` FK, `language`, `subject`, `body`, `approval`, `approved_by`, `created_at`
- `ai_outreach_events`: provider-confirmed delivery and reply events only
- `ai_audit_logs`: admin actions with actor and timestamp

Row-level security should restrict every table to admins. The demo never reads or writes these tables.

## Verification

Run from the repo root:

| Check | Result |
|---|---|
| `npx vitest run src/__tests__/aiEmployee` | 35 / 35 pass |
| `npx tsgo -p tsconfig.check.json` | exit 0 |
| `npx biome lint` on the new files | clean |
| `vite build` with demo env | exit 0 |
| `vite build` without demo env | exit 0; no demo strings in the bundle |
| Browser test (Playwright, headless Chromium) against both builds | 29 / 29 pass, no page errors |

The browser test covered: no login form, public-source import (rejection and acceptance), all tabs, lead search and detail, duplicate flags, CSV download, draft rejection for relative links, draft generation in Malayalam, send disabled, approval, Do Not Contact, research job cap and pause/resume/cancel, disconnect and reconnect (persisting across reload), a 375px mobile viewport with no horizontal overflow, and production redirecting to `/auth`.

The full `vitest run` ran only the AI Employee tests. The repo has no other test files.

## Deployment

**Not deployed. No Preview URL exists yet.** Creating or connecting a Preview deployment requires your approval.

### What the repository shows (verified)

- **Production (live app):** `deploy/bulkskart/` is a self-hosted stack. Caddy on a VM serves `www.bulkskart.com` and `bulkskart.com` (`deploy/bulkskart/caddy/bulkskart.caddy`). It routes `/auth`, `/rest`, `/storage`, `/functions`, `/realtime`, and `/graphql` to self-hosted Supabase (`supabase-envoy`). Everything else goes to the `bulkskart-web` container. Postgres runs inside that stack.
- **`netlify.toml` and `vercel.json`:** each contains only an SPA rewrite to `/index.html`, plus cache headers. Neither file names a project, site, or domain. Nothing in the repo links them to a live deployment.
- **Vite build stamp:** `vite.config.ts` writes `gitCommit: "prod-aws-vm"`, which points to the VM deployment, not Netlify or Vercel.
- **Neon:** not referenced by the app. The Neon project "Bulkskart ai" is separate.

### Recommended Preview (for your approval)

1. Build the `ai-employee-admin` branch as a **Preview-only** deploy on Netlify or Vercel, whichever is already connected to the repo. Do not connect a new one without your say-so.
2. Set these variables in the **Preview** scope only:
   ```
   VITE_AI_EMPLOYEE_DEMO=true
   VITE_SUPABASE_URL=https://demo.invalid
   VITE_SUPABASE_ANON_KEY=<placeholder, not a real key>
   ```
   The placeholder means the Preview cannot reach the production database.
3. Keep Production unchanged. Do not set the demo flag in Production, and do not touch the Caddy/VM stack.
4. Do not use a `preview.bulkskart.com` subdomain on the VM. That would share the production host.

Local equivalent: `VITE_AI_EMPLOYEE_DEMO=true VITE_SUPABASE_URL=https://demo.invalid VITE_SUPABASE_ANON_KEY=x npx vite build`, then serve `dist/` with SPA fallback and open `/admin/ai-employee`.

## Pre-existing issues found (not changed)

1. `/dashboard/admin` (`AdminDashboardFull.tsx`) checks `if (profile && profile.role !== 'admin')`. This passes while the profile is still null, so it fails open. The new page does not share this check.
2. `src/db/supabase.ts` calls `createClient` at module load, so the app cannot render without Supabase env values.
3. The build plugin in `vite.config.ts` rewrites `src/version.json` and `public/version.json` on every build.
4. `package.json`'s `dev` and `build` scripts only print a message. Use `lint` for checks.
5. The `.rules` ast-grep rules run from `pnpm lint` but require `ast-grep` to be installed. I did not run them.

## Open items

- Approve the Preview deployment target (Vercel or Netlify, whichever is already connected) and the placeholder Preview env above.
- Approve or reject the proposed Supabase tables above.
- Decide on a research provider and budget. Nothing searches the web until then.
- Choose a messaging provider. Until then, drafts stay in review, and delivery or replies are never recorded.
- Native-speaker review of the Tamil, Hindi, Telugu, and Malayalam drafts before any real use.
