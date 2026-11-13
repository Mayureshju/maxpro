# Phase 3 — unified lead CRM, assignment and attribution

Phase 3 implements GEM-13, GEM-14 and GEM-24, with bounded local conversation (GEM-16) and viewing (GEM-15) workflows. This is an integrated fictional browser-local prototype; production remains unimplemented. No messages, provider webhooks, calendar requests, notifications, commits, pushes or deployments were made.

## Shared workflow and ownership

Select any saved canonical property in the CRM intake simulator → choose Website, Property Finder, Qatar Living, Meta Lead Ads or WhatsApp → review an internal illustrative JSON contract → acknowledge fictional intake → process the event. The lead table, six-stage pipeline, detail workspace, assignment ledger, inbox, viewing agenda, analytics and control tower read the same existing demo repository. The existing canonical property Enquiries tab now lists these same linked leads and opens the intake simulator with that property preselected; its legacy sample count is removed.

`lead-crm.ts` defines canonical leads, typed first-touch attribution history, receipt events, decisions, local conversations, notes, viewing requests and explicit fictional spend inputs. The existing provider owns their persistence under **the same** `maxpro-gemini-v3-demo-state` key. Property `schemaVersion: 1` and `connectorSchemaVersion: 2` remain intact; additive `crmSchemaVersion: 1` owns the CRM payload. Existing properties/jobs and canonical IDs are preserved. Legacy static lead/conversation fixtures are no longer dependencies of the navigable CRM workflows.

`lead-storage.ts` migrates pre-CRM envelopes into safe fictional examples linked only to properties that exist in the current demo organization. It validates known fields, IDs, enums, timestamps, organization/property references, identity, consent, assignment ownership, conversation metadata, viewings, receipt-to-source/event relationships and spend. Unknown injected fields are omitted. Invalid CRM records are excluded with a visible warning while valid property/job records remain. An unsupported CRM version starts an empty CRM with a recovery warning. Existing whole-envelope damaged/unavailable storage recovery remains intact.

Limits: 500 leads, 2,000 receipt rows, 500 dated spend entries, 500 activity entries per lead, and the existing 4 MB repository ceiling. Storage failure remains visible and preserves in-memory actions for the open session. A reset clears the entire fictional repository, including properties and publishing history; use the existing diagnostics reset deliberately.

## Domain rules

- Internal payload contracts retain source-specific example field names. They are **not official provider webhook schemas**. Inputs must identify the current demo organization, a real saved canonical property, a `DEMO-` event ID, a valid non-future source timestamp, the fixed `Demo visitor` identity and a boolean reply preference. Unknown fields and real contact details are rejected. Raw payloads are never retained.
- Deduplication uses the tuple `(organization ID, source provider, original event ID)`. Same-name enquiries remain distinct. A valid replay appends a duplicate receipt linked to the original lead and leaves assignment, attribution and rotation unchanged. Received/accepted/rejected/duplicate receipts are append-only within local capacity; valid example event IDs remain visible even for rejected events.
- First-touch source, event identity, source time, received time, destination and optional fictional campaign reference remain unchanged through ownership, qualification, pipeline, conversation and viewing actions. The typed attribution history records that original touch. No publishing job implies that a remote lead was received.
- Round-robin uses known active, available organization agents and a persisted rotation cursor. Only newly accepted rotating intake advances it. Manual routing holds leads for human assignment. If rotating eligibility is empty, a known available fallback receives the lead; otherwise it enters the assignment backlog. Manual reassignment/handover rejects unknown or unavailable agents and records previous/new owner and reason. Reload never routes existing leads again.
- Pipeline stages: New, Contacted, Qualified, Viewing, Won and Lost. Qualification is separate from stage: entering Qualified marks it qualified; closing retains that qualification. Reopening/review can change qualification explicitly. Priority, qualification/follow-up details, internal notes and activities persist.
- Every conversation belongs to its canonical lead/property and source. Inbound examples use `received-local`; replies use `saved-local`. Opt-out blocks local replies. Agent handover uses the same assignment command. No message is sent or marked remotely delivered.
- Viewing requests derive their property from the selected lead, use Qatar UTC+03 date/time and a known available agent, and persist Requested → Confirmed → Completed or Cancelled status. They reject past/invalid times, Friday and example hours outside 09:00–18:00 (one-hour slots), plus local agent/property overlaps within one hour. Cancellation releases the local slot. Warnings explicitly state that no live calendar was checked.

## Reporting provenance

Analytics filters the shared leads by immutable source, canonical property and inclusive Qatar received dates; its period selector changes the actual date window. The report and control tower update after local intake, assignment, stage and qualification changes.

| Measurement | Definition |
| --- | --- |
| Total / channel / property leads | Number of matching canonical local lead records |
| New | Current stage is New; no unsupported response/SLA claim |
| Qualified | Explicit qualification status is Qualified, retained across closure |
| Won / conversion | Won stage count divided by all leads in the selected cohort |
| Assignment backlog | Unassigned leads excluding Won/Lost |
| First local reply time | Earliest outbound local message minus received timestamp, only valid nonnegative samples; mean and sample count shown |
| Fictional cost / qualified lead | Explicit dated channel spend divided by qualified leads in the same source/date cohort; unavailable for property-filtered cohorts because spend has no property allocation |
| Portal views, reach, actual spend, revenue | Unavailable; never inferred from queued jobs, approvals or campaign drafts |

A missing cost input differs from an explicitly entered zero. Costs and report measurements remain fictional/local, not verified financial ROI or provider analytics.

## UI and accessibility

Preserves existing `px-*`/`gm-*` tokens, restrained eucalyptus/stone colors and task-specific compositions. The CRM uses filterable semantic tables and a horizontally scrollable six-stage pipeline; details use a dossier/timeline; inbox uses a conversation split pane; routing shows eligibility and decisions; viewings use a linked form/agenda; reports expose source/property provenance. Unknown IDs, loading, empty filters, invalid payloads, consent opt-out, demo acknowledgement, local success and storage recovery have explicit states.

Primary touched controls and headings support English/Arabic with real `dir=rtl`, logical CSS and locale-preserving links. Provider names, fictional agent names and some internal metadata remain English. **Professional Arabic completion/native-speaker UAT remain outstanding.**

Real browser QA found and corrected a clipped inherited reply button width, flush form spacing and inherited low-contrast text. Scoped CRM color changes preserve unrelated screens. Keyboard coverage includes focus/Enter pipeline switching and the existing workspace navigation; semantic labels, focus outlines and focusable table/pipeline scroll regions remain available. Axe WCAG 2 A/AA and 2.1 AA checks cover touched **main content**, including pipeline, in EN/AR desktop/mobile: **28 audited screen states, zero reported violations**. Per-project/locale JSON reports are in `artifacts/phase3/logs/axe-*.json` (the separate `axe-first.json` intentionally preserves the initial failing audit). This is not a full accessibility or physical-device certification.

## Files and contracts

- `apps/web/src/lib/lead-crm.ts`: canonical CRM types, internal example mappings, normalization, deduplication, routing, commands and metric selectors.
- `apps/web/src/lib/lead-storage.ts`: migration, field validation, reference checks and known-field recovery.
- `apps/web/src/components/gemini/demo-provider.tsx`: additive CRM envelope and shared command/persistence integration; Phase 1/2 publication guards remain intact.
- `lead-workspace.tsx`: intake, table/pipeline, detail, conversation, assignment and reusable CRM controls.
- `lead-analytics.tsx`: linked viewing workflow and source/property/date reporting with explicit cost inputs.
- `agency-operations.tsx`: control-tower lead counts and qualification/assignment/conversion summaries derive from shared records.
- Existing CRM route entry points and `prototype/relationships.tsx` now resolve the integrated components; `prototype/inventory.tsx` connects the property Enquiries tab and contextual intake; browser-created lead IDs resolve after hydration.
- `apps/web/tests/e2e/lead-crm.spec.ts`: domain and real browser acceptance, screenshots and axe audits.
- `openspec/changes/0007-unified-lead-crm/`: proposal, design, acceptance and completed-task evidence; `docs/11-gemini-requirements.md`: updated traceability.

## Verification evidence

Baseline was commit `388613fc0c9a1d2c18e22dd2d29643c86b887b3e` on main, with a clean working tree. GitHub Actions run [43307667444](https://github.com/Mayureshju/maxpro/actions/runs/43307667444) was **completed / success**, verified before implementation, not inferred from an in-progress run. The unpushed Phase 3 work has no new remote CI run. Evidence: [baseline-ci.json](../artifacts/phase3/logs/baseline-ci.json).

- `CI=true pnpm install --frozen-lockfile`: passed; lockfile unchanged. [Install log](../artifacts/phase3/logs/install.log).
- Baseline `pnpm typecheck` / `pnpm lint`: passed. Baseline full browser suite: **572 passed / 4 intentional skips**. [Baseline browser log](../artifacts/phase3/logs/baseline-e2e.log).
- Final `pnpm typecheck`: passed. [Log](../artifacts/phase3/logs/typecheck.log).
- Final `pnpm lint`: passed, no warnings. [Log](../artifacts/phase3/logs/lint.log).
- `pnpm build`: **failed**, default Turbopack hit the sandbox process/port restriction (`Operation not permitted`). It is not represented as a passing default build. [Failure log](../artifacts/phase3/logs/build-default.log).
- Final `pnpm --dir apps/web build --webpack`: passed. [Log](../artifacts/phase3/logs/build-webpack.log).
- Final `pnpm --dir apps/web test:e2e`: **624 passed / 12 intentional skips** (636 cases total). This includes 52 passing new Phase 3 cases; all retained Phase 0–2 tests pass, with the documented analytics assertion update. [Final browser log](../artifacts/phase3/logs/e2e-final.log).
- Focused Phase 3 run before the final attribution-history addition: **52 passed / 8 intentional skips**. [Log](../artifacts/phase3/logs/e2e-crm-third.log). The final full run covers the attribution-history addition too.
- `git diff --check`: passed after restoring earlier-phase generated screenshots.

Browser commands use `PLAYWRIGHT_PORT=3107 PLAYWRIGHT_PRODUCTION=1 PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'`. Playwright starts/stops its isolated local production server. Sandbox restrictions required approved local server/browser execution. A baseline dev attempt also encountered the pre-existing port 3000 development lock; the verified baseline and all feature browser runs used an isolated production server. No pre-existing user server was stopped.

The Phase 0–2 suite is retained. One older combined routing/viewing/analytics test now checks the shared Website cohort (two local leads, zero qualified) instead of fixed decorative “7 / 2” sample totals; its routing/viewing behavior remains covered. Publishing/feed tests remain unchanged. Earlier failed new-test attempts are retained in logs: selector ambiguity with Next's route announcer and nested select labels, and navigation timing were corrected before passing runs. Initial axe contrast failures are retained in `axe-first.json`; the permanent audits verify the corrected screens.

## Actual browser screenshots

64 full-page screenshots cover eight populated workspaces × two locales × four explicit widths. These are captures of the running Next.js app, not placeholder images. Table/pipeline scroll within bounded keyboard-focusable regions; page-width assertions check no document overflow. Contact sheets support review of all captures. [Manifest](../artifacts/phase3/screenshots/manifest.json).

| Workspace | English 1440 | Arabic 375 |
| --- | --- | --- |
| CRM table | [Capture](../artifacts/phase3/screenshots/en-1440-table.png) | [Capture](../artifacts/phase3/screenshots/ar-375-table.png) |
| Pipeline | [Capture](../artifacts/phase3/screenshots/en-1440-pipeline.png) | [Capture](../artifacts/phase3/screenshots/ar-375-pipeline.png) |
| Lead detail | [Capture](../artifacts/phase3/screenshots/en-1440-detail.png) | [Capture](../artifacts/phase3/screenshots/ar-375-detail.png) |
| Inbox | [Capture](../artifacts/phase3/screenshots/en-1440-inbox.png) | [Capture](../artifacts/phase3/screenshots/ar-375-inbox.png) |
| Assignment | [Capture](../artifacts/phase3/screenshots/en-1440-assignment.png) | [Capture](../artifacts/phase3/screenshots/ar-375-assignment.png) |
| Viewings | [Capture](../artifacts/phase3/screenshots/en-1440-viewings.png) | [Capture](../artifacts/phase3/screenshots/ar-375-viewings.png) |
| Analytics | [Capture](../artifacts/phase3/screenshots/en-1440-analytics.png) | [Capture](../artifacts/phase3/screenshots/ar-375-analytics.png) |
| Control tower | [Capture](../artifacts/phase3/screenshots/en-1440-control-tower.png) | [Capture](../artifacts/phase3/screenshots/ar-375-control-tower.png) |

The same filenames exist for EN/AR at 1024 and 768 pixels. Prior Phase 1/2 screenshot files generated by regression tests are restored to their baseline contents after final validation, keeping new review evidence under Phase 3.

## Remaining limitations and next milestone

All external services remain unconnected. Provider lead APIs, schemas and geographic permissions are unverified; the internal examples make no capability claim. Browser command guards demonstrate workflow boundaries, not authentication, real tenant isolation, tamper resistance, concurrency safety, durable audit or production routing. Real operations require OIDC/membership/RBAC, server-side tenant checks, PostgreSQL constraints, signed partner intake, atomic deduplication/routing, durable inbox/calendar records, privacy/retention governance and official authorized integrations. Reply preferences demonstrate a local guard, not legally verified messaging consent or WhatsApp policy enforcement.

AGENTS.md requires an independent second-tool review. Claude Code was invoked read-only against this same change and returned an **expired authentication** error requiring `claude auth login` or a configured unattended token. [Review attempt](../artifacts/phase3/logs/independent-review.log). No independent review is claimed; this prerequisite remains open. The implementation and test evidence are complete independently of that unavailable reviewer.

Recommended next prototype milestone: organization membership, role/approval boundaries and admin audit workflows (GEM-01 / GEM-18 / GEM-20), preserving this canonical property/CRM chain. Then establish the approved production OIDC/PostgreSQL/outbox foundation and obtain official partner contracts before any real publishing, intake or messaging pilot. Commercial plan examples remain QAR 179 / 725 / 1,800+, **illustrative pending approval**.
