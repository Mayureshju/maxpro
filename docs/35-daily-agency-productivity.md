# Phase 14 — daily agency productivity

Implemented 15–16 November 2026 against baseline `f5b0c39f6c3aebf7c2449609b9bf1fd075b0ec86`. [OpenSpec 0018](../openspec/changes/0018-daily-agency-productivity/proposal.md). Frontend-only fictional browser demo. No commit, push or deployment.

## Confirmed problems and improvements

| Live audit finding | Implemented behavior |
| --- | --- |
| Completed help still offers Continue setup; an older draft masks a completed listing | Saved-record selector chooses the most advanced coherent property journey. Empty agencies get Start; partial journeys link to their first incomplete task. Completion is compact and disclosed only when help is opened. Dismissal stays organization-specific. |
| Dashboard repeats summary panels and exposes `crm:reply`, `crm:assign`, `crm:intake` | Attention links open incomplete/review-needed properties, unassigned/unanswered enquiries, channel blockers and campaign drafts. Recorded viewings/approvals appear beside a compact portfolio line. A centralized EN/AR presenter uses actual audit snapshots, safe historical fallback labels and validated target links. Duplicate intake is explicitly identified. |
| Quick Add gives two similar editor-entry decisions | Save & continue validates essentials and opens the editor. Save as draft preserves partial facts and opens the property workspace. A blank form can start the full editor. Inline errors, focus, unsaved protection, permission feedback and synchronous duplicate protection remain. No extra required fields. |
| Inventory’s useful facts disappear off-screen on phones; revisions dominate rows | Search and combined state/type/purpose/price filters remain. Title sorting replaces fictional-view ranking. Rows show price/period, state, updated date and a contextual action. Mobile rows reflow; empty/loading states are explicit. Seed totals are withheld during organization restore. |
| Property and channel results offer little recovery | Overview distinguishes content completeness, human review and local outcomes. Blocked channels link directly to preparation; archived properties offer guarded resume. Latest channel status follows updated attempt timestamps, including retries. Revisions stay in contextual record details. |
| Leaving Publish & Promote loses channel context | Property/goal/channel/active-panel choices resume through URL and organization/property-scoped tab storage. These are navigation choices, separately explained from saved jobs, campaign drafts, sharing records and approvals. Saved records provide recovery links. Unsaved portal approval checkboxes reset on reload; saved campaign receipts remain domain-owned. |
| Enquiries are difficult to triage; switching Inbox conversations discards a draft | Recorded unanswered/qualified/viewing filters, last activity and contextual assignment/reply links improve the existing list. Inbox adds property-aware search and unanswered filtering, a readable mobile list, draft-discard confirmation and localized received/saved labels. Replies remain local. |

Existing deterministic contextual assistance retains source inspection, editing, Accept/Dismiss and stale-source protection. Portal, paid Meta/Google advertising and direct WhatsApp preparation retain separate guarded engines. Six-section navigation, approved tokens/logo, public website, quotas and commercial disclosures remain.

Primary traceability: GEM-01/02/03/05/06/08/10/11/13/14/15/16/21/22/24. Existing GEM-04/07/09/12/17–20 compatibility is retained. GEM-23 remains unimplemented; the approved future Frappe architecture is unchanged.

## Browser evidence

The baseline audit exercised empty, one-property/one-enquiry and established fictional agencies. Established fixtures contain **25 properties, 32 enquiries and two portal histories**; final coverage also includes a campaign draft. Fixtures are injected only into isolated test contexts, use validated fictional records and never alter default sample data. Separate-organization tests verify empty operations, old-URL recovery, scoped campaigns/leads and independent onboarding preferences.

All images are actual running Next.js captures: baseline development app, final Webpack production app. These are scripted evaluator checks, with no real-user participants.

| Surface | Before | After |
| --- | --- | --- |
| Established dashboard | [Desktop](../artifacts/phase14/before/established-dashboard.png) | [Desktop](../artifacts/phase14/after/established-dashboard.png), [completed help](../artifacts/phase14/after/completed-guide.png) |
| Empty agency | [Desktop](../artifacts/phase14/before/empty-dashboard.png) | [Desktop](../artifacts/phase14/after/empty-dashboard.png) |
| Quick Add | [Arabic phone](../artifacts/phase14/before/ar-320-quick-add.png) | [Arabic phone](../artifacts/phase14/after/ar-320-quick-add.png) |
| Inventory | [English phone](../artifacts/phase14/before/en-375-inventory.png) | [English phone](../artifacts/phase14/after/en-375-inventory.png) |
| Property workspace | [Desktop](../artifacts/phase14/before/en-1440-property.png) | [Desktop](../artifacts/phase14/after/en-1440-property.png) |
| Channel preparation | [Arabic phone](../artifacts/phase14/before/ar-320-publish.png) | [Arabic phone](../artifacts/phase14/after/ar-320-publish.png) |
| Leads / Inbox | [Leads](../artifacts/phase14/before/en-375-leads.png), [Inbox](../artifacts/phase14/before/ar-320-inbox.png) | [Leads](../artifacts/phase14/after/en-375-leads.png), [Inbox](../artifacts/phase14/after/ar-320-inbox.png) |

[Capture manifest](../artifacts/phase14/screenshot-manifest.json), [final viewport audit](../artifacts/phase14/after/audit.json), [contact sheets](../artifacts/phase14/contact-sheets). Seven daily surfaces × EN/AR × 1440/1280/1024/768/375/320 = **84 final responsive checks**. Additional captures cover empty/partial/completed setup and the preserved first-use journey.

## Actual verification

| Check | Result |
| --- | --- |
| `CI=true pnpm install --frozen-lockfile` | Passed with approved npm access after sandbox DNS failure; manifests/lockfile unchanged. [Install log](../artifacts/phase14/install.log). |
| `pnpm typecheck` | Passed. [Log](../artifacts/phase14/typecheck.log). |
| `pnpm lint` | Passed. [Log](../artifacts/phase14/lint.log). |
| `pnpm build` | Failed at the documented sandbox Turbopack/PostCSS worker-port restriction (`Operation not permitted`). [Actual failure](../artifacts/phase14/build-default.log). |
| `pnpm --dir apps/web build --webpack` | Passed; 167 generated pages. [Log](../artifacts/phase14/build-webpack.log). |
| Production Playwright | **1,030 passed, 38 expected skips, zero failures; 1,068 total, 4.1 minutes.** Includes all preserved regressions and 34 new daily-workspace/project cases. The skips comprise 37 retained duplicate/device cases and one duplicate screenshot matrix. [Full log](../artifacts/phase14/playwright-full.log). |
| New whole-document accessibility | **28 checks, zero violations** across seven whole-document daily surfaces × EN/AR × desktop/mobile, including completed help, invalid Quick Add and selected portal preparation. [Reports](../artifacts/phase14/accessibility). |
| Six-width visual inspection | **84 checks, zero document-overflow findings**; all 12 EN/AR contact sheets inspected, with detailed mobile/form/completion captures. The manifest contains 175 before/after captures. |
| Separate source review | Four findings repaired and rechecked; no remaining blocker in the bounded review. [Review](../openspec/changes/0018-daily-agency-productivity/review.md). |

The final suite retains prior domain and UI assertions, with selectors updated for the intentional creation labels and distinct property row actions. Development logs retain failed/interrupted attempts: fixture validation, a promotion navigation race, stale/ambiguous test selectors, low-contrast helper text and undersized Inbox links. These are excluded from final passing counts. The first full-suite launch was blocked by the approval-review service’s usage limit; it was authorized successfully after the user resumed the task.

Reproduce against a served Webpack build: `PLAYWRIGHT_PRODUCTION=1 PLAYWRIGHT_PORT=3214 PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=<installed Chromium executable> MAXPRO_EVIDENCE_ROOT=artifacts/phase14/regression pnpm --dir apps/web test:e2e --timeout=60000 --trace=off`. This host uses installed Chromium headless shell 145 and `caffeinate -i -s`. The owned port-3214 QA server was stopped after verification; the pre-existing development server was retained. `python3 scripts/daily-workspace-sheets.py` indexes screenshots.

## Remaining limits and stakeholder checks

Navigation preferences are tab-local; unsaved campaign/message content still requires an explicit save and is protected on departure. Inventory/lead filters reset on section re-entry and organization switching. Browser data and roles remain editable UX simulations, without durable storage or production tenant security. Historical audit events without sufficient saved context intentionally use generic labels. There are no provider acknowledgements, sent messages, actual spend, collected view analytics or live AI. No backend-scope conflict was introduced.

Professional Arabic completion, native-speaker review, physical mobile keyboards, Safari/Firefox and assistive-technology UAT remain outstanding. Chromium emulation and axe results are not full accessibility certification.

Suggested stakeholder acceptance:

- Create a fictional agency; save partial and complete properties; resume first use and inspect compact 5/5 completion.
- Find a property among 25 records, inspect its next action and resume a blocked portal or saved campaign.
- Assign an enquiry, prepare an optional reply suggestion and save a local reply without losing an unsaved draft.
- Replay example intake and verify readable, truthful activity; switch agencies and confirm independent operations/preferences.
- Review EN/AR at all six widths, especially Inbox, forms, focus, channel tabs and mobile row actions.
