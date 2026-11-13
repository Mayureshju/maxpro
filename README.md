# MaxPro / Gemini-aligned v3 — Real Estate Operating System prototype

**Primary product:** B2B SaaS / Connector Hub for Qatar and GCC property owners, brokers and agencies, aligned with the user-supplied Gemini PRD. This is **source code for an interactive local prototype**, not a real publishing or payment service.

## What changed from v2
- Primary workspace now opens the **Agency Control Tower**, not the public-marketplace-centric overview.
- Replaced fake Portal A/B/C navigation with **named provider concepts** (Property Finder, Qatar Living, Bayut/Dubizzle, Meta catalogue, Google Ads/PMax, GA4, WhatsApp, AI); all explicitly unconnected.
- Added canonical structured property editor with bilingual copy and commercial/licensing fields. Browser-local edits affect example pre-flight results.
- Added **guided publishing workbench** with per-destination validation, setup checks, acknowledgement and local attempt history (no remote delivery).
- Added connector marketplace, setup detail, XML/JSON/CSV feed previews, field mapping inspector, lead round-robin preview, viewing requests, brand/domain UI, channel ROI UI, plan entitlements and connector health console.
- Gemini PRD pricing illustrations and quotas (Starter 179 QAR / Pro 725 / Agency 1800+; listings 3/25/negotiated; destinations 1/2/all authorized) replace v2 conflicting sample tiers. No real charging occurs.
- Added product/architecture/UX/acceptance/SDD documentation and shared instructions for Codex, Claude Code and Cursor.

## Scope honesty
All external provider connectors, API fields, credentials, feeds, AI, SMS/WhatsApp, billing, booking and marketing are **mock/proposed**. Browser-local setup state does not mean connected. An item "Queued locally" is **not** published or acknowledged by a portal. Most v2 legacy screens still need complete Arabic translations and UX refinement. There is no API, database, server auth, durable file storage or real webhook processing in this package. Full Next.js build and Playwright browser tests could **not** be run while preparing the ZIP because registry access was unavailable; TS/TSX syntax and artifact completeness were checked separately.

## Run with Codex
```bash
unzip maxpro-gemini-aligned-v3.zip
cd maxpro-gemini-aligned-v3
corepack enable
corepack prepare pnpm@10.15.0 --activate
pnpm install
pnpm dev
```
Open `http://localhost:3000/en/workspace`. Next run:
```bash
pnpm typecheck
pnpm lint
pnpm build
pnpm --dir apps/web exec playwright install chromium
pnpm --dir apps/web test:e2e
```

### Core user journey to review
1. `/en/workspace` — Agency Control Tower.
2. `/en/workspace/inventory/AQ-10233/edit` — save a browser-local master property edit.
3. `/en/workspace/hub/marketplace` — browse integration prerequisites.
4. `/en/workspace/hub/connectors/property-finder` and `/qatar-living` — explicitly prepare **demo** readiness (not live credentials).
5. `/en/workspace/publish` — select `AQ-10233`, choose destinations, validate and simulate a local dispatch.
6. `/en/workspace/hub/jobs` — inspect independently blocked/queued local results; `/workspace/inventory/AQ-10233/publishing` shows listing-scoped history.
7. `/en/workspace/leads/assignment`, `/en/workspace/leads/viewings` and `/en/workspace/analytics` — routing, booking and channel ROI prototypes.
8. `/en/workspace/billing` — switch illustrative plans and see quota rules; `/en/workspace/admin/connector-health` — demo integration operations.

The older v2 public property discovery, sample campaigns, AI Studio, WhatsApp inbox, admin and support AI screens remain as secondary modules, while incomplete items are explicitly listed in `docs/11-gemini-requirements.md`.

## Documents to read
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
