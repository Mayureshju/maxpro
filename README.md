# MaxPro / Gemini-aligned v3 — Real Estate Operating System prototype

**Primary product:** B2B SaaS / Connector Hub for Qatar and GCC property owners, brokers and agencies, aligned with the user-supplied Gemini PRD. This is **source code for an interactive local prototype**, not a real publishing or payment service.

## What changed from v2
- Primary workspace opens an **Agency Dashboard** with six sections: Dashboard, Properties, Publish & Promote, Leads & Inbox, Performance and Settings.
- Replaced fake Portal A/B/C navigation with **named provider concepts** (Property Finder, Qatar Living, Bayut/Dubizzle, Meta catalogue, Google Ads/PMax, GA4, WhatsApp, AI); all explicitly unconnected.
- Added canonical structured property editor with bilingual copy and commercial/licensing fields. Browser-local edits affect example pre-flight results.
- Added **guided publishing workbench** with per-destination validation, setup checks, acknowledgement and local attempt history (no remote delivery).
- Added connector marketplace, setup detail, XML/JSON/CSV feed previews, field mapping inspector, lead round-robin preview, viewing requests, brand/domain UI, channel ROI UI, plan entitlements and connector health console.
- Gemini PRD pricing illustrations and quotas (Starter 179 QAR / Pro 725 / Agency 1800+; listings 3/25/negotiated; destinations 1/2/all authorized) replace v2 conflicting sample tiers. No real charging occurs.
- Added product/architecture/UX/acceptance/SDD documentation and shared instructions for Codex, Claude Code and Cursor.

## Scope honesty
All external provider connectors, API fields, credentials, feeds, AI, SMS/WhatsApp, billing, booking and marketing are **mock/proposed**. Browser-local setup state does not mean connected. An item "Queued locally" is **not** published or acknowledged by a portal. Phase 6 adds an explicit Arabic presentation catalogue and all-route RTL/accessibility evidence; native-speaker approval remains pending. There is no API, database, server auth, durable file storage or real webhook processing in this package. The original ZIP could not be built under its packaging environment. Phase 6 installs the locked dependencies and records actual typecheck, lint, build and browser results in `artifacts/phase6/verification.json`; the default Turbopack worker-port restriction is distinguished from the supported webpack production build.

## Run with Codex
```bash
unzip maxpro-gemini-aligned-v3.zip
cd maxpro-gemini-aligned-v3
corepack enable
corepack prepare pnpm@10.15.0 --activate
pnpm install
pnpm dev
```
Open `http://localhost:3000/en/sign-in` for fictional demo sign-in, or `/en/register` to create an empty agency workspace. Next run:
```bash
pnpm typecheck
pnpm lint
pnpm build
pnpm --dir apps/web exec playwright install chromium
pnpm --dir apps/web test:e2e
```

### Core user journey to review
1. `/en/register` or `/en/sign-in` — create/select a fictional agency without credentials.
2. `/en/workspace` — agency dashboard and next actions.
3. `/en/workspace/inventory/new` — create a stable browser-local property draft.
4. `/en/workspace/inventory/[id]/edit` — guided facts, photos, optional reviewed assistance, and save.
5. `/en/workspace/publish?property=[id]` — choose portals, paid ads or direct sharing; prepare, validate and review each channel.
6. `/en/workspace/inventory/[id]` — property actions and independently queued/blocked/simulated/prepared local results.
7. `/en/workspace/leads` and `/en/workspace/inbox` — linked enquiries, assignment, local replies and viewings.
8. `/en/workspace/analytics` — recorded channel/campaign observations.
9. `/en/workspace/settings` — agency profile, members, illustrative billing and integrations. Technical configuration is contextual under Advanced Settings; platform controls are isolated in demo/testing utilities.

See [agency-first UX and route map](docs/29-agency-first-ux.md) and [verification](artifacts/agency-first/verification.md) for the redesign, actual screenshots, requirement coverage and remaining gaps.

Property inventory, Studio, campaigns, CRM/inbox, organization management and administration now share canonical browser-local records. Public discovery remains a secondary showcase. Compatibility routes link to their primary workflows, and remaining planning concepts are labelled explicitly. Production gaps are listed in `docs/11-gemini-requirements.md`.

## Documents to read
- `docs/29-agency-first-ux.md` — current agency journey, six-section route map, screenshots and UX gaps.
- `docs/reference/GEMINI_USER_PRD.txt` — exact user-supplied Gemini content.
- `docs/00-source-of-truth.md` — source precedence and unresolved business decisions.
- `docs/11-gemini-requirements.md` — 24-group requirement/route map and truthful statuses.
- `docs/12-architecture-contracts.md` — production architecture, data entities, APIs and security gates (design only).
- `docs/13-design-acceptance.md` — visual, accessibility, Arabic and interaction standards.
- `docs/14-delivery-plan.md` — phased SDD milestones and tool assignment.
- `openspec/changes/0003-gemini-realignment/` — scoped change proposal/spec/design/tasks.
- `docs/15-codex-kickoff.md` — direct Codex continuation task.

**Repository policy:** `AGENTS.md` is canonical across Codex / Claude Code / Cursor. This package is not deployed and no Git remote was modified.

## Phase 5 backend direction

Next.js remains the frontend. A future custom Frappe application owns database, authentication/role permissions, Python business methods and background jobs. Earlier NestJS proposals are superseded. This repository remains a browser-local prototype: no Frappe/backend/live integrations are implemented. See [Frappe blueprint](docs/22-frappe-backend-blueprint.md) and [Phase 5 report](docs/21-phase5-organization-admin.md).

## Phase 6 prototype acceptance candidate

Use **Demo sign-in** to select an agency and its independent fictional properties, connector setup, jobs, CRM, campaigns and assignment settings. The organization/persona testing selectors are now isolated under Settings → Advanced settings → Demo/testing utilities (see the agency-first redesign). New organizations start empty; Pearl Gate retains its original canonical IDs. Simulated roles and editable local storage provide no authentication or secure tenant isolation. Never enter personal data or credentials.

See [final audit](docs/23-final-prototype-audit.md), [acceptance matrix](docs/24-prototype-acceptance-matrix.md), [Frappe handoff](docs/25-frappe-integration-readiness.md) and [OpenSpec 0010](openspec/changes/0010-final-prototype-acceptance/proposal.md). Exact commands, limitations and screenshot evidence live in `artifacts/phase6/`. Final independent review and Arabic native-speaker signoff remain explicit prerequisites; no production or independent quality approval is implied.
