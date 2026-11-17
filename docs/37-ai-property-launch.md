# Compact operations and contextual AI — current-state audit

Baseline: local `main` with substantial pre-existing uncommitted Phase 15 changes. No fetch/reset/overwrite. Audit uses the actual running Next.js app on localhost:3000 and current source, not historical defect lists. Before screenshots: `artifacts/phase16/before`; geometry: `before/metrics.json`.

## Confirmed gaps

- Workspace page headings are 34px. Inventory first row begins at y≈565px at 1440×1000 after Intro, two actions, separate counters, collection heading, toolbar and results bar. Leads first row begins at y≈836px. Dashboard repeats five 136px summary cards before operational queues.
- AI is hidden behind editor/portal/campaign/enquiry-specific buttons. There is no global contextual request surface or named AI Property Launch entry.
- Property operations already co-locate facts, media links, channel histories, campaigns and enquiries; improving navigation is appropriate, replacing the page is not.
- Empty dashboards still repeat empty operational panels and zero cards below the existing first-use guide. Preserve the guide's saved-record derivation and organization preference.
- Existing locale/phone screens have working logical layout and reflowing inventory rows. No baseline page overflow was observed in the captured desktop/375px screens. Professional Arabic review remains outstanding; new drawer and launch UI need six-width QA.

## Already solved; regression risks

- Six agency navigation groups, collapse preference, native/source proposal inspector, four-step canonical wizard, Quick Add validation/unsaved protection, first-use guide and canonical public previews exist.
- PublishPromote already separates portals, paid Meta/Google/Click-to-WhatsApp advertising and direct link/message preparation. It preserves unsaved channel forms across goal changes and tab-local navigation choices. Keep its panels and commands.
- `canonical-property` owns optimistic revisions and media; DemoProvider saveProperty invalidates dependent campaign/organization reviews. `syndication-engine` owns setup/readiness/quota/approval fingerprints and per-destination queue/history/idempotency. `campaign-engine` owns separate media budget/service fee and ordered revision-sensitive approvals.
- `lead-crm` retains intake deduplication, source attribution, consent/STOP/handover, assignment, replies and viewings. Analytics uses explicit recorded observations/spend. No invented reporting is needed.
- `local-assistance` and `marketing-ai` are deterministic, source-grounded demonstrations. AssistancePanel snapshots source keys and rejects stale acceptance. No live LLM, extraction or secure tenant boundary exists.

## Milestone

GEM-01–08/10/11/13/14/16/18/19/21/22/24: compact operational primitives and a complete contextual property-to-local-outcome journey. Keep campaign/CRM engines and public showcase compatible. Add only typed future Frappe AI contracts; no backend, external access, credentials or paid calls. Broad CRM/campaign redesign and live integrations remain separate work.

## Implemented decisions and file inventory

- `apps/web/src/components/workspace/workspace-shell.tsx`: global EN/AR MaxPro AI entry, reset by organization/path, preserving six navigation groups and existing role surfaces.
- `apps/web/src/components/agency/maxpro-ai.tsx` and `apps/web/src/lib/copilot.ts`: responsive native drawer, canonical property context, editable prompt, eight bounded read/navigation/proposal intents, sources/scope, unsupported-request fallback, source-grounded metrics and links. Prompt text stays in memory and is never sent to a model. Results scroll into the drawer viewport on phones.
- `apps/web/src/components/agency/property-copy-proposal.tsx`: shared editable bilingual before/after inspector with original source revision, missing-fact warnings, dismiss and explicit canonical save. Changed descriptions invalidate human review and dependent approvals through the existing engine. Stale/cross-organization proposals cannot save.
- `apps/web/src/components/agency/assistance-panel.tsx` and `apps/web/src/lib/body-scroll-lock.ts`: shared dialog scroll ownership prevents an organization switch from leaving the page locked after nested proposal/Copilot dialogs unmount; focus restoration and existing inspector behavior remain.
- `apps/web/src/components/agency/ai-property-launch.tsx` and `publish-promote.tsx`: existing-property picker or new draft entry, saved facts/media/copy review, readiness repair, then the existing portal/advertising/direct workflow with its own setup, quota, human approvals and independent histories. `mode=launch` and property selection are navigation only. Extraction and Google Business Profile posts are explicitly future integrations.
- `apps/web/src/components/agency/workspace-pages.tsx`: compact linked portfolio line, daily shortcuts and property launch/campaign links; empty agencies retain the saved-state first-use guide without repeated empty panels/counters.
- `apps/web/src/components/prototype/inventory.tsx`: one compact collection heading/count, demoted import, a single primary create action, preserved search/filter/sort/grid and mobile cards; redundant description/summary strip removed.
- `apps/web/src/styles/{tokens.css,layout.css,components/tables.css,workflows/properties.css,workflows/copilot.css}` and `apps/web/src/app/globals.css`: 28px workspace headings, 24px desktop gutters, compact shared headings/tables, task shortcuts, native drawer and logical responsive launch layout. No dependency or replacement design system.
- `apps/web/src/lib/ai-gateway-contract.ts`: future Frappe request/response, source refs, tool allowlist, proposal decisions, errors, audit/usage and cost/timeout policy types. Contract only; no endpoint or Node backend.
- `apps/web/tests/e2e/ai-launch.spec.ts`, `scripts/ai-launch-evidence.cjs`, this document and OpenSpec `0020`: regression and genuine screenshot/accessibility evidence.

## Preserved authority and complete journeys

The milestone reuses stable property IDs and organization slices. Draft/media/wizard state, optimistic revisions, unsaved-change guards, source review invalidation, quotas, publishing retry/idempotency/history, campaign budget/fee/ordered approval engine and CRM consent/STOP/deduplication remain unchanged. Public property pages, advanced workbenches and existing routes remain compatible.

1. Empty agency → dashboard or inventory → Quick Add → saved canonical draft → editor/property operations.
2. Property → global AI readiness/copy → editable source-labelled proposal → explicit save → invalidated review → AI Property Launch → existing human review → channel setup/preflight/approval → local queue/history.
3. Copilot campaign intent → property-specific Meta or Google preparation → existing draft/save/ordered approvals; Copilot never creates an ad, approves or spends automatically.
4. Copilot outstanding enquiries/follow-up → linked Inbox → existing reply proposal review → local draft/reply commands with consent/handover visible.
5. Copilot recorded-performance explanation → real scoped CRM counts and report provenance; no invented reach, spend or ROI.

## Rendered visual and accessibility evidence

The matched English 1440×1000 inventory moves the first row from **564.8px to 397.9px**, recovering about **167px** above the data. Workspace headings decrease from 34px to 28px. Final sample rows are about 65px high and all six sample properties fit in the first viewport. The Arabic desktop first row is about 400px. These are measured browser geometry, not customer usability-study results. `artifacts/phase16/{before/metrics.json,after/canonical-metrics.json}` contains the values.

There are **156 final screenshots**: 108 established-agency views across EN/AR and 320/375/768/1024/1280/1440px, plus 48 matching built-in-record/empty-agency captures. All have actual app content. The new inventory/launch/open-Copilot matrix has **36 whole-document WCAG 2.2 AA scans with zero axe violations**. Matching default captures record zero page overflow; the full width matrix also asserts no page overflow. Dialog captures use viewport screenshots so a full-page capture cannot misrepresent the backdrop below the viewport.

Visual review inspected actual desktop inventory/dashboard, empty dashboard, Copilot, proposal and Arabic phone launch/selection layouts. The compact phone header retains navigation, AI, locale and notifications; agency identity/settings remain in navigation. Native-speaker Arabic, physical devices, Safari/Firefox and assistive-technology review remain outstanding. [Evidence index](../artifacts/phase16/README.md) links every requested surface and its baseline where the feature existed.

## Final verification

| Command/check | Actual result |
| --- | --- |
| `CI=true pnpm install --frozen-lockfile` | Passed; lockfile current, dependencies unchanged. Existing optional build-script policy remains. [Log](../artifacts/phase16/install.log). |
| `pnpm typecheck` | Passed. [Log](../artifacts/phase16/typecheck.log). |
| `pnpm lint` | Passed. [Log](../artifacts/phase16/lint.log). |
| `pnpm build` | Failed at the documented sandbox Turbopack/PostCSS worker-port restriction: `Operation not permitted`. [Actual log](../artifacts/phase16/build-default.log). |
| `pnpm --dir apps/web build --webpack` | Passed on the final source. [Log](../artifacts/phase16/build-webpack.log). |
| `pnpm --dir apps/web test:e2e` with production/browser environment below | **1,078 passed, 42 expected skips, zero failures; 1,120 total in 4.2 minutes.** Preserved regression plus 36 new cases (34 passed, two duplicate width-matrix project skips). [Final log](../artifacts/phase16/playwright-final.log). |
| Six-width new accessibility matrix | **36 scans, zero axe violations**, EN/AR inventory, launch and open Copilot. [English](../artifacts/phase16/after/en-accessibility.json), [Arabic](../artifacts/phase16/after/ar-accessibility.json). |
| Actual screenshots/visual QA | 156 final PNGs, current production app, actual empty/sample/established demo records. Matching captures and full width matrix show no page overflow. [Index](../artifacts/phase16/README.md). |
| Independent review / source hygiene | No remaining blocking findings; [review](../openspec/changes/0020-ai-property-launch/review.md). `git diff --check` passed. |

Exact browser reproduction: `PLAYWRIGHT_PRODUCTION=1 PLAYWRIGHT_PORT=3216 PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=<installed Chromium executable> MAXPRO_EVIDENCE_ROOT=artifacts/phase16/regression caffeinate -i -s pnpm --dir apps/web test:e2e --timeout=60000 --trace=off`, serving the webpack build on port 3216. `caffeinate` is the local macOS sleep-prevention wrapper, not an application dependency. Chromium desktop and mobile emulation were actually run. Screenshot reproduction is `node scripts/ai-launch-evidence.cjs`.

Early logs are retained accurately: initial test assumptions used the wrong editor field/draft fixture; review repaired Arabic intent ordering; the first full run had two new 320px breadcrumb target-size failures while 1,068 cases passed. Later interrupted runs preceded the verified nested-modal scroll cleanup and phone-header refinements. Only `playwright-final.log` records final acceptance of the frozen implementation. No failure is represented as passing.

No commit, push or deployment command was run by this task. The checkout's existing work was preserved. The owned production QA server is stopped after verification; the pre-existing development server is retained. No frontend verification prerequisite remains missing. Production prerequisites below remain unimplemented; no live integration or secure authentication is claimed.

## Future production gates and next milestone

Custom Frappe persistence/authentication/membership/permissions, secure media storage, server validation, transactional outbox/idempotency, server-generated approval receipts/audit and durable workers remain unimplemented. Local roles and organization controls are UX simulation, not production authorization or secure isolation.

The AI gateway must derive tenant/actor from authenticated Frappe state; enforce source access and current revisions, structured output/tool schemas, untrusted-document boundaries, human proposal acceptance, retention/redaction, metering, daily/request cost limits and timeouts. Model tools must never authorize publishing, spending or moderation. Server-side encrypted provider configuration and chosen provider credentials are required; no browser API key or direct paid-model call is implemented.

Official portal contracts/API/feed access and geography eligibility remain required for Property Finder, Qatar Living and additional portals. Meta advertising/catalogue eligibility and assets, Google Ads account/conversion permissions, WhatsApp official number/templates/consent/webhooks, Google Business Profile eligibility/access, GA4 consent and approved billing/payment/commercial terms need separate implementation and approval.

Next frontend milestone: consolidate the existing campaign/CRM filters and review surfaces into compact property-linked marketing and enquiry workspaces; the Leads table still has substantial pre-table space and is not claimed as redesigned here. Production priority: implement and verify the custom Frappe property/revision/media/organization boundary, then the authorized, metered AI proposal gateway against these contracts. Continue native-speaker Arabic completion and physical-device/Safari/Firefox/assistive-technology UAT. No professional Arabic sign-off is claimed. The broader campaign/CRM redesign is intentionally outside this coherent slice.
