# Phase 13 — first-time agency experience

2026-11-15. Baseline `618b51e8250bf7c706c3d71e3a15b43b454d66fc` matched this checkout. [OpenSpec 0017](../openspec/changes/0017-first-time-agency/proposal.md). Frontend-only fictional browser demo; no backend, Frappe implementation, live AI, integration, payment, commit, push or deployment.

## Audit and improvements

A fresh Chromium context created an empty fictional agency and followed the actual property → Qatar Living local queue → property enquiries path. This was an evaluator walkthrough, without research participants. [Original action log](../artifacts/phase13/before/actions.json).

| Observed first-use problem | Implemented behavior |
| --- | --- |
| Empty dashboard offers an invitation, then multiple empty daily panels without a resumable plan | Inline five-step guide derives progress from one property's saved content, human review and channel records. Dismissal survives reload per agency; help reopens on the dashboard. Seeded/established agencies retain the daily dashboard. |
| Add property leads to a confirmation that only creates an empty record | Quick Add saves a working title, purpose, type, city and price through the guarded create command. Full-editor entry also carries partially entered facts. Empty drafts remain available; synchronous repeat-submit protection prevents duplicate properties. |
| Default Continue path traverses a separate optional assistance step; reload returns to step one | Details offers direct review; the full four-step editor and inline assistance remain. Saved transitions update `?step=` so reload resumes the active step. Saving an incomplete draft remains valid. |
| Save errors are generic; invalid advanced fields can be hidden | Numeric/integer/coordinate errors identify and reveal their fields. Rental terms are validated for rentals. Conflicts retain the existing optimistic revision guard. Contextual helpers explain studio bedrooms, rental period, coordinates and fictional permits. |
| Sparse source data can produce suggestions without explaining omissions | Facts, bilingual descriptions and portal/ad/message copy keep source inspection, editable proposals, Accept/Dismiss and stale-source checks. Listing-derived copy warns about absent canonical sources. Acceptance never silently saves or approves the listing; no AI service is called. |
| Portal checks list problems without a repair action | A direct completion link opens the relevant basic/details step. Selected property survives the existing property → Publish & Promote → repair → return flow. Goal is retained in the URL; portals, paid ads and direct messaging retain separate engines and approvals. |
| Queued portal outcome has no simple first-enquiry handoff | Current queued Qatar Living/Property Finder results offer explicitly fictional intake and a property/source-linked CRM record. Reopening returns that record. Existing normalization, assignment and organization/source/event deduplication remain authoritative. |
| A new agency has no routing setup and its owner is unavailable | First-example enquiry explains ownership and offers **Make owner available & assign**, explicitly invoking existing availability/assignment commands with permission checks. The existing inbox saves a local reply. Property/dashboard return links preserve context. |

Guide completion has no click-based flags. Connector preparation alone does not complete the channel task; it needs a saved property-linked channel record. Edited revisions regress readiness when help is reopened. A prior successful local outcome keeps the automatic guide from interrupting established daily work. UI preferences do not imply authentication or secure tenant isolation.

## Observed interaction counts

Count button/link/radio/checkbox activations once; exclude typing, scrolling and evidence capture. Both runs used the same fictional facts and optional bilingual-copy assistance. These are scripted task counts, not measured customer speed or usability research.

| Task / endpoint | Before | After |
| --- | ---: | ---: |
| Create agency → first local Qatar Living queue | 19 | 18 |
| Optional assisted details → review | 4 | 3 |
| Local queue → open its newly created example enquiry | No direct action; baseline stopped after two actions at the property enquiries/intake workbench | 1 |
| Create agency → queue → example → explicitly assign owner → conversation → saved local reply | Not completed in baseline audit | 22 |

Quick Add replaces the empty-draft confirmation with a meaningful save; it does not eliminate the later fact, media, review or channel checks. [Final recorded actions](../artifacts/phase13/after/actions.json); [reproduction script](../scripts/first-use-evidence.cjs).

## Actual screenshots

All images are captures of the running Next.js app. Baseline used the existing development server; final evidence uses the Webpack production build. No generated illustrations stand in for rendering.

| Task | Before | After |
| --- | --- | --- |
| Fresh dashboard | [Desktop](../artifacts/phase13/before/dashboard.png) | [Desktop](../artifacts/phase13/after/dashboard.png), [Arabic phone](../artifacts/phase13/after/mobile-chromium-ar-welcome.png) |
| Property entry | [Empty-draft confirmation](../artifacts/phase13/before/new-property.png) | [Quick Add](../artifacts/phase13/after/new-property.png) |
| Editor | [Basic facts](../artifacts/phase13/before/editor.png) | [Basic facts](../artifacts/phase13/after/editor.png), [EN phone details/dock](../artifacts/phase13/after/en-375-editor.png), [AR phone details/dock](../artifacts/phase13/after/ar-375-editor.png) |
| Local result | [Queue only](../artifacts/phase13/before/outcome.png) | [Queue + example handoff](../artifacts/phase13/after/outcome.png) |
| First enquiry | [Property intake workbench](../artifacts/phase13/before/enquiries.png) | [Linked enquiry](../artifacts/phase13/after/enquiry.png), [saved agent reply](../artifacts/phase13/after/conversation.png) |

`after/{en,ar}-{1440,375}-*.png` covers dashboard help, Quick Add, details, property and publishing; first-use test captures also cover empty welcome, queue and enquiry in both locales/device projects. Visual inspection checked readable source/review content, logical RTL placement, visible mobile actions and the connected enquiry. Full regression retains route, keyboard, short-viewport, media, modal and accessibility checks.

## Requirements and verification

GEM-01/02/03/04/05/06/07/08/13/14/16/21/22/24. GEM-10/11 channel-copy warnings share existing campaign controls; GEM-18/19 quotas/illustrative pending-approval terms remain. Existing GEM-09/12/15/17/20 compatibility is preserved. GEM-23 remains unimplemented.

| Check | Actual result |
| --- | --- |
| `CI=true pnpm install --frozen-lockfile` | Passed with npm access approved; dependency manifest and lockfile unchanged. Existing optional-script policy unchanged. [Log](../artifacts/phase13/install.log). |
| `pnpm typecheck` / `pnpm lint` | Passed. [Types](../artifacts/phase13/typecheck.log), [lint](../artifacts/phase13/lint.log). |
| `pnpm build` | Failed at the existing sandbox Turbopack/PostCSS worker-port restriction, `Operation not permitted`. [Actual log](../artifacts/phase13/build-default.log). |
| `pnpm --dir apps/web build --webpack` | Passed; 167 generated pages. Served the final browser tests and screenshots. [Log](../artifacts/phase13/build-webpack.log). |
| Full preserved Playwright suite + new cases | **997 passed, 37 expected skips, zero failures; 1,034 total, 3.6 minutes.** Includes all 14 new first-use cases. [Full log](../artifacts/phase13/playwright-full.log). |
| Accessibility / visual QA | **440 reports, zero violations:** 372 existing whole-document/route checks, 60 existing marketing/interaction checks, eight new guide/Quick Add checks. [New checks](../artifacts/phase13/first-use-axe.json); real desktop/mobile/RTL screenshots inspected. |
| Independent bounded review | No remaining blocker after repairs; [review record](../openspec/changes/0017-first-time-agency/review.md). |
| Source hygiene | `git diff --check` passed. No marketing source, dependency/lockfile, production backend or external adapter changes. |

Production reproduction: `PLAYWRIGHT_PRODUCTION=1 PLAYWRIGHT_PORT=3213 PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=<installed Chromium executable> MAXPRO_EVIDENCE_ROOT=artifacts/phase13/regression caffeinate -i -s pnpm --dir apps/web test:e2e --timeout=60000 --trace=off`, with the Webpack build served on port 3213. `node scripts/first-use-evidence.cjs` captures the measured journey; `node scripts/first-use-accessibility.cjs` audits the new first-use surfaces. The owned production QA server was stopped; the pre-existing development server was left running.

Early focused runs retained in `artifacts/phase13` exposed incorrect test assumptions about selecting a newly created organization and owner availability, a locale selector, and reading state before the first mutation. The owner-availability UX gap and test assumptions were repaired; the complete final run above passes. No failed/interrupted run is represented as passing. No new product-scope conflict was found.

## Limits and remaining issues

English-labelled note extraction is intentionally bounded. Professional Arabic completion/native-speaker review, physical iOS/Android keyboards, Safari/Firefox and assistive-technology UAT remain outstanding. The editor still supports four steps and advanced source/compliance fields; official provider requirements are illustrative. Goal persists in the publishing URL, while unsubmitted channel selections remain session-only. Browser-local data and preferences are not durable production storage or secure authorization. All publishing results are local; there are no provider acknowledgements, real enquiries, sent messages, collected analytics or spend.
