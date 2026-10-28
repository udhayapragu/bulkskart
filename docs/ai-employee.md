# Bulkskart AI Employee (admin area)

Route: `/admin/ai-employee`

## What is built

A separate admin workspace inside the existing Vite + React + Supabase app. It has six tabs:

- **Overview**: KPI tiles for leads, qualification, outreach drafts, replies, interest, registration starts, registrations, and subscriptions.
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
- `src/__tests__/aiEmployee/aiEmployee.test.ts`: 25 unit tests
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
| `npx vitest run src/__tests__/aiEmployee` | 25 / 25 pass |
| `npx tsgo -p tsconfig.check.json` | exit 0 |
| `npx biome lint` on the new files | clean |
| `vite build` with demo env | exit 0 |
| `vite build` without demo env | exit 0; no demo strings in the bundle |
| Browser test (Playwright, headless Chromium) against both builds | 26 / 26 pass, no page errors |

The browser test covered: no login form, all tabs, lead search and detail, duplicate flags, CSV download, draft rejection for relative links, draft generation in Malayalam, send disabled, approval, Do Not Contact, research job cap and pause/resume/cancel, disconnect and reconnect (persisting across reload), a 375px mobile viewport with no horizontal overflow, and production redirecting to `/auth`.

Only the one unit-test file exists in the repo. The full `vitest run` ran that file alone.

## Deployment

**Not deployed.** The repo contains `vercel.json`, `netlify.toml`, and a self-hosted Supabase Docker stack under `deploy/`. No Vercel project matching this repo exists in the default scope, and no Netlify connection was found. Connecting a deployment was not authorized, so no Preview URL exists yet.

To test it yourself now: `VITE_AI_EMPLOYEE_DEMO=true VITE_SUPABASE_URL=https://demo.invalid VITE_SUPABASE_ANON_KEY=x npx vite build`, serve `dist/`, and open `/admin/ai-employee`. Use SPA fallback, since the app's `vercel.json` and `netlify.toml` both rewrite to `/index.html`.

## Pre-existing issues found (not changed)

1. `/dashboard/admin` (`AdminDashboardFull.tsx`) checks `if (profile && profile.role !== 'admin')`. This passes while the profile is still null, so it fails open. The new page does not share this check.
2. `src/db/supabase.ts` calls `createClient` at module load, so the app cannot render without Supabase env values.
3. The build plugin in `vite.config.ts` rewrites `src/version.json` and `public/version.json` on every build.
4. `package.json`'s `dev` and `build` scripts only print a message. Use `lint` for checks.
5. The `.rules` ast-grep rules run from `pnpm lint` but require `ast-grep` to be installed. I did not run them.

## Open items

- Choose the Preview deployment target (Vercel or Netlify) and approve creating or connecting it.
- Approve or reject the proposed Supabase tables above.
- Decide on a research provider and budget. Nothing searches the web until then.
- Choose a messaging provider. Until then, drafts stay in review, and delivery or replies are never recorded.
- Native-speaker review of the Tamil, Hindi, Telugu, and Malayalam drafts before any real use.
