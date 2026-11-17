# Complete product experience — current audit

Baseline `ad1c430`, equal to freshly fetched origin/main. Locked install succeeded. Audit used the actual running checkout on localhost:3000, Chromium EN/AR desktop 1440 and phone 375. [Before captures and geometry](../artifacts/phase17/before/audit.json): 108 captures, zero HTTP errors, page errors or document overflow. These are evaluator observations, not participant research. The user's historical defect list is not current evidence.

| Route / area | Confirmed current experience and action |
| --- | --- |
| `/` | Already product-led, forest hero and actual editor capture. AI only appears below the initial preview; dashboard marketing capture is stale (five tall cards absent from live page). Add explicit AI outcome section and five-stage preview; refresh captures. |
| `/solutions`, `/how-it-works` | Existing distinct platform ledger and keyboard walkthrough work; retain and add shared public assistance/navigation. |
| `/features/ai-assistance` | Already dedicated capability page with source/review example; no duplicate page needed. Surface existing AI Launch/Copilot and retain limitations. |
| `/integrations` | Truthful unavailable portal/ad/WhatsApp/measurement examples; eligible GBP explanation absent. Add explicitly planned, conditional business-presence concept. |
| `/pricing` | Correct illustrative prices, quotas and pending-approval note; retain, expose through grounded public assistance. |
| `/solutions/agencies` | Working team scenario; preserve. Homepage needs clearer owner/broker/agency task examples. |
| `/contact`, `/faq` | Functional local preview and grounded FAQ, no real contact delivery. Retain and use as public assistant sources. |
| `/properties`, `/properties/AQ-10233` | Secondary showcase distinct from SaaS. Current browse/detail routes work. Retain boundaries and navigation. |
| `/register`, empty `/workspace` | Record-derived welcome guide, no zero panels, direct create action already implemented. Preserve and explain optional AI in guide. |
| Populated `/workspace` | Already 28px heading, compact record summary and real attention work. Getting-started help and shortcuts add space above work; move help below work. No KPI redesign needed. |
| `/workspace/inventory` | First row about 398px; existing search, state, sort, grid and mobile records work. Purpose is hidden behind advanced filters; expose it. Do not repeat old 565px inventory defect. |
| `/workspace/inventory/new`, `/:id/edit` | Quick Add and guarded four-stage wizard already exist. Draft save, review and unsaved recovery retained. Floating assistant must clear footer controls. |
| `/workspace/inventory/:id` | Existing operations/details/activity tabs, linked channels/campaigns/leads; add compact direct section navigation to content/photos/readiness. Preserve one property authority. |
| `/workspace/publish?mode=launch` | Existing AI Launch and same publishing engines; no second implementation. Preserve approvals, channel repair context and outcomes. |
| Workspace Copilot | Header entry; drawer is keyed by path. Browser interaction confirms an answer disappears after navigation. Move to persistent logical-corner launcher with memory-only session and context/source separation. |
| `/workspace/publish` | Existing per-channel blockers, local queue and no-acknowledgment disclosure work. Preserve regression behavior. |
| `/workspace/campaigns`, `/new?property=…` | Existing creative/budget/fee/review engines; keep route and guarded commands, add contextual assistance. |
| `/workspace/leads` | First row about 810px: description, nav, summary, quick filters and two filter rows consume viewport. Reduce layout spacing, use primary search/owner/stage row with compact secondary filters; retain all filters. Demote fictional simulator action. |
| `/workspace/inbox` | Linked property, reply/consent/handover already present. Preserve and add contextual follow-up prompt with mobile composer clearance. |
| `/workspace/analytics` | Recorded CRM/source performance with provenance already exists; reuse bounded explanation, no invented ROI. |
| `/workspace/billing`, `/settings` | Working local plan/role and organization controls. Retain restrictions; no actual billing/authentication. |

Persona decisions: landlord gets essential-first draft and welcome guide; broker gets visible rent/sale filtering and persistent assistance; manager gets attention/enquiries before setup help; agent retains existing command permission matrix (own-record production scopes remain a Frappe prerequisite); marketing gets property-bound existing budget/fee/approval workflow; Arabic user gets logical launcher/RTL and bilingual task/source labels; platform admin remains in separate advanced tools; visitor gets public-only grounded guidance. No new persona authority is invented.


## Implemented experience

OpenSpec [0021](../openspec/changes/0021-complete-product-experience/proposal.md). The approved forest/emerald palette, fonts, six-section workspace, existing routes and metadata remain. No new dependency or domain engine was introduced.

- Homepage: immediate property/AI/review/enquiry promise; six specific AI outcomes; keyboard-controlled Add property → AI prepares → Your review → Choose channels → Manage enquiries preview; owner/broker/agency task examples; accurate unavailable channel groups and conditional, planned Google Business Profile explanation. Existing AI capability page now connects AI Launch and the floating assistant. Actual product screenshots were refreshed with source/crop hashes.
- Shared assistant frame: logical inline-end launcher (right EN, left AR), native dialog, explicit focus wrap/Escape/return focus, body-scroll ownership, safe-area composer, mobile footer clearance and collision measurement against visible actionable controls. CSS zoom conversion prevents offscreen placement; panel height keeps composer and close control reachable.
- Workspace assistance: existing bounded Copilot and proposal inspector; in-memory maximum 20-turn session; unsent input and source snapshots retained across minimize/client navigation. Context follows the current property/lead/campaign route. Organization and persona changes remount the session; public entry cannot access it. Changed source revisions disable reopening an old copy proposal until the user asks again; the original inspector independently guards acceptance.
- Public assistance: public constants, FAQ, plan examples and availability explanations only, with source links and recovery for unsupported/private-record requests. No DemoProvider import or record query. Public memory is discarded at workspace boundaries. Both modes explicitly use local rules, with no live model.
- Daily work: populated dashboard attention/enquiries move above setup help; empty onboarding keeps record-derived progress. Inventory purpose filter is visible alongside search/state, with property type in each record. Property section links reach existing content/photos/review/publishing/campaign/enquiry authorities. CRM simulator becomes secondary; filters/summary use less vertical space and mobile record padding is corrected. Billing settings entry follows the existing permission.

Measured at 1440×1000 with matching canonical records: English dashboard work starts at **312px vs 376px**; lead records at **594px vs 809px**, about **215px earlier**. Arabic equivalents: **321px vs 385px** and **596px vs 793px**. Inventory stays at about **398px EN / 400px AR**, with purpose now visible. These are geometry observations, not measured user task-time improvements.

## Connected journey verification

| User scenario | Before → after / preserved authority | Browser coverage |
| --- | --- | --- |
| First landlord | Existing registration/Quick Add/wizard retained; optional AI guidance and persistent assistance | `first-use`, `agency-first`, `ai-launch` new-agency-to-local-enquiry journeys |
| Broker price update | Same canonical save/revision and review invalidation; source snapshots cannot become fresh approval | `lifecycle`, `stability`, `product-experience` cross-tab retained-answer rejection |
| 25+ properties | Search/filter/sort/list/grid remain; rent/sale visible and no-results reset restores all 25 fixture records | `daily-productivity`, `enterprise-ux`, `product-experience` |
| Manager assignment | Dashboard exposes enquiry work earlier; assignment and linked Inbox preserved | `lead-crm`, `daily-productivity`, `agency-first` |
| Marketing operator | Existing property/creative/budget/fee/ordered review workflow remains authoritative | `campaigns` complete EN/AR journeys and approval tests |
| Publishing repair | Existing exact blockers, direct repair and channel-context recovery retained | `connector-hub`, `productivity`, `daily-productivity`, `ai-launch` |
| Arabic agent on phone | Existing Arabic wizard plus logical assistant, contextual prompts and native controls | Both projects, EN/AR journeys and six-width matrix |
| No connected providers | Draft/review/setup prerequisites remain; no false external completion | `first-use`, `agency-first`, bounded Copilot recovery |
| Lead follow-up | Existing linked property, source-grounded reply, consent/STOP and handover unchanged | `lead-crm`, `agency-first`, `daily-productivity`, contextual Inbox assistance |
| Interruption | Existing unsaved/revision/reload recovery retained; chat/input survive navigation and clear on agency change | `frontend-polish`, `ai-launch`, `product-experience` including two-tab cases |

Preserved suites also cover quotas, missing media/source facts, archived/unknown properties, empty histories, long portfolios and no-results filters. No feature is represented as live merely because a click or local queue succeeded.

## Review and evidence

[Separate source and browser review](../openspec/changes/0021-complete-product-experience/review.md) records repaired focus, private-question recovery, stale-answer, launcher/control collision, mobile CRM padding and 200% CSS-zoom findings. No external independent design/security sign-off is claimed.

[Evidence index](../artifacts/phase17/README.md) links requested before/after surfaces. Before: **108** actual captures. After: **324** actual captures, 27 states × EN/AR × 320/375/768/1024/1280/1440. Open public/editor/Inbox assistant checks add **36** screenshots and whole-document WCAG A/AA scans. Public product images are actual screenshots and crops, never generated illustrations.

Native Arabic editorial approval, physical devices, browser-native zoom/assistive-technology UAT and Safari/Firefox remain review limits. CSS 200% scaling and equivalent narrow layouts are exercised; they are not a claim of physical-device or every browser's native zoom verification. Production authentication, secure organization/own-record permissions, Frappe persistence, integrations, live models, payments and official partner eligibility remain unimplemented. Existing branding is retained; final MaxPro/AqarPro naming is pending approval.

## Final verification — 18 November 2026

| Command / check | Actual result |
| --- | --- |
| `CI=true pnpm install --frozen-lockfile` | Passed at the start of the task after approved registry access. Lockfile current, dependencies unchanged; existing optional build-script policy retained. |
| `pnpm typecheck` | Passed. [Log](../artifacts/phase17/typecheck.log). |
| `pnpm lint` | Passed. [Log](../artifacts/phase17/lint.log). |
| `pnpm build` | Failed at the documented Turbopack/PostCSS worker-port sandbox restriction, `Operation not permitted`. [Actual failure](../artifacts/phase17/build-default.log). |
| `pnpm --dir apps/web build --webpack` | Passed on final source; production output served acceptance. [Log](../artifacts/phase17/build-webpack-final.log). |
| `pnpm --dir apps/web test:e2e --timeout=60000 --trace=off` | **1,110 passed, 44 expected skips, zero failures; 1,154 total, 4.4 minutes.** Both Chromium projects actually ran against frozen final production output. [Final log](../artifacts/phase17/playwright-acceptance.log). |
| New assistant accessibility / focus / placement | **36 whole-document WCAG A/AA scans, zero violations**; EN/AR at all six widths, public/editor/Inbox. Keyboard wrap, Escape, source/context changes, table-action clearance, 200% CSS scaling and viewport reachability passed. [EN](../artifacts/phase17/interactions/en-accessibility.json), [AR](../artifacts/phase17/interactions/ar-accessibility.json). |
| Screenshots and visual QA | **108 before + 324 after + 36 expanded states = 468 PNGs**. After matrix: zero HTTP/page errors and zero document-overflow findings. All 12 locale/width overview sheets reviewed, with full-resolution detail inspection. [Index](../artifacts/phase17/README.md), [final capture](../artifacts/phase17/visual-final.log), [hash manifest](../artifacts/phase17/screenshot-manifest.json). |
| Source / documentation hygiene | `git diff --check` passed; document link check has no missing targets. No domain engine, dependency input, original ID or navigable route was replaced. [Source audit](../artifacts/phase17/source-review.json), [links](../artifacts/phase17/document-link-review.json). |

Reproduction: serve the webpack build on port 3017, then run `PLAYWRIGHT_PRODUCTION=1 PLAYWRIGHT_PORT=3017 PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=<installed headless Chromium> MAXPRO_EVIDENCE_ROOT=artifacts/phase17/regression caffeinate -i -s pnpm --dir apps/web test:e2e --timeout=60000 --trace=off`. Default screenshot script is `node scripts/ux-transformation-evidence.cjs after`; point `MAXPRO_UX_BASE_URL` to the running server. `python3 scripts/ux-transformation-sheets.py` rebuilds contact sheets and hashes (requires local Pillow). The public product refresh uses `scripts/client-reference-product.cjs` with `MAXPRO_PRODUCT_BASE_URL` and records source/crop provenance.

The exact initial failures are retained. `playwright-full.log` is an invalidated run against a rebuilt active server. `playwright-pre-zoom-fix.log` includes nine repaired zoom/old-preview-assertion failures. `playwright-before-final-placement.log` is a passing earlier full run; the final `playwright-acceptance.log` includes the verified lower-corner refinement. No failed or interrupted command is represented as a pass.

No frontend dependency prerequisite remains missing. Professional Arabic, real-device/native-browser/assistive-technology and independent human reviews remain as listed above. Future backend/integration/AI work remains a separate milestone, with the custom Frappe architecture unchanged. No commit, push or deployment was performed. The task-owned production QA server is stopped after verification; the pre-existing development server is retained.
