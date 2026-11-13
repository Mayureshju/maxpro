# Final frontend UI/UX review

13 November 2026 · OpenSpec 0011 · frontend-only stakeholder review candidate.

## Scope and baseline

Baseline: local `main` at `9cbb6daf8b4ce1e1469e70a4be11a545247f729f`, verified against the connected GitHub main-branch read. No commit, push or deployment. No backend, external provider, authentication, database, payments or AI service was added. Phase 0–6 canonical browser-local data and operational guards remain the source of workflow state.

Read AGENTS.md, exact Gemini PRD, source precedence, requirements/design/architecture contracts and existing phase acceptance documentation. Audit covered all 83 active page templates. Before captures include every template at EN/AR 1440 and EN 375; the final matrix covers both languages at 1440/1024/768/375. Dynamic IDs are resolved to canonical examples; the campaign unavailable screen is recovery evidence, with populated campaign detail captured separately by the workflow suite.

## Prioritized audit and implementation

| Priority | Finding | Result |
|---|---|---|
| P1 | Decorative control tower, duplicated statistics, missing schedule/campaign/capacity | Task queue and scoped property/enquiry/job/readiness summary; shared viewings/campaigns/usage; correct Add property handoff |
| P1 | Inventory lacks combined operational filters and recovery | Purpose/type/price range plus existing state/search/sort, price validation, thumbnails, list/grid selection, reset/create empty states |
| P1 | Unsaved property edits disappear on navigation | Dirty state, sticky save actions, unload warning, accessible stay/discard dialog; failed saves keep edits |
| P1 | Generic/sparse public platform and repeated agency detail | Task-specific capabilities, personas/connectors, proper directory/profile/portfolio and unknown-ID recovery |
| P1 | Empty contact/sign-in first column and limited access discovery | Demo context, working registration/workspace handoffs and desktop/mobile sign-in navigation |
| P1 | Bulk-import file selection enables a no-op button | Consistently unavailable mapping action with explanation and canonical creation alternative |
| P1 | Static unrelated notifications | Activity derives from selected organization jobs/leads/campaigns; read markers explicitly view-local |
| P1 | Rapid campaign-stage choice can be reset during newly saved draft navigation | Explicit navigation-pending state; canonical creation guard; regression test |
| P1 | Public footer overflows at tablet width | Wrapping links and a one-column tablet footer; regression and every-route capture |
| P2 | Tiny operational text, inconsistent control sizes and dominant demo explanation | Shared readable type/table/form/status sizing, compact context disclosure, navigation search and mobile focus/scroll handling |
| P2 | Missing shared route feedback | Bilingual route skeleton and retry/error recovery; existing empty/success/validation states preserved |
| P2 | Remote public photo dependency, long FAQ | Existing bundled fictional fixtures; native keyboard-friendly FAQ disclosures |

## Screen-by-screen audit

Every row received running-app review. “Retained” means existing functional work was preserved and shared shell/type/responsive improvements apply; it does not imply that a new workflow was invented. Screenshot names encode viewport, language and route. Example: `after/375-ar-workspace-publish.png`.

| Route template / audited example | Priority | Findings and resulting frontend treatment |
|---|---|---|
| `/` | P2 | Editorial B2B hero retained; bundled fictional image fixture replaces remote dependency. Showcase remains secondary. |
| `/about` | P2 | Editorial explanation retained; header/footer and readable shared controls reviewed. |
| `/agencies` | P1 | Single paragraph replaced with a clear fictional directory entry and linked agency profile. |
| `/agencies/pearl-gate-realty` | P1 | Repeated directory replaced with agency identity, portfolio, property links and selected-organization preview handoff. Unknown ID has explicit recovery. |
| `/compare` | P2 | Bounded selection and scrollable comparison retained; responsive footer corrected. |
| `/contact` | P1 | Empty first column filled with useful preview context; form has truthful local validation and demo-workspace access. |
| `/faq` | P2 | Long static answers converted to keyboard-operable native disclosures. |
| `/favorites` | P2 | View-local selection retained, with explicit persistence limits; responsive footer corrected. |
| `/map` | P2 | Clearly labeled schematic map and property handoffs retained; no geographical/provider claim. |
| `/pricing` | P2 | Illustrative three-tier comparison retained; no new terms or discounts. Tablet footer fixed. |
| `/privacy` | P2 | Draft legal notice retained; improved responsive footer. Counsel approval remains pending. |
| `/properties` | P2 | Existing local keyword/purpose/type/price search retained; bundled sample photos and responsive footer. |
| `/properties/AQ-10233` | P2 | Existing sample details and validated enquiry preview retained; local photo fixtures. No enquiry is sent or stored. |
| `/register` | P2 | Existing canonical organization onboarding retained; shared form and mobile context polish. |
| `/resources` | P2 | Editorial educational preview retained; shared typography and responsive footer reviewed. |
| `/saved-searches` | P2 | Honest view-local search preview retained; no alerts delivered. |
| `/sign-in` | P1 | Empty first column replaced with demo boundaries and registration/workspace access; no real authentication. |
| `/solutions` | P1 | Sparse generic sections replaced with capabilities, connector directory, persona use cases and working workflow links. |
| `/terms` | P2 | Draft terms retained; no contracting capability inferred. |
| `/workspace` | P1 | Decorative/repeated summary replaced by scoped priorities, canonical Add property, enquiries, viewing schedule, connector readiness, campaigns and capacity. |
| `/workspace/admin` | P2 | Scoped directory/inspector retained; existing role guards preserved, forms/tables clearer. |
| `/workspace/admin/audit` | P2 | Local organization-scoped audit search/filter retained; no immutable audit claim. |
| `/workspace/admin/cms` | P2 | Retained operational-settings alias; no invented content-management backend. |
| `/workspace/admin/connector-health` | P2 | Prepared vs authorized vs externally connected distinction retained; diagnostics table more readable. |
| `/workspace/admin/integrations` | P2 | Retained diagnostics alias and migration notice; no second integration state. |
| `/workspace/admin/moderation` | P2 | Revision-aware queue and inspector retained; text sizes improved and stale-review rules preserved. |
| `/workspace/admin/organizations` | P2 | Directory alias retained; organization inspection and independent local slices preserved. |
| `/workspace/admin/plans` | P2 | Versioned illustrative plan configuration retained; quotas/amounts not invented. |
| `/workspace/admin/reports` | P2 | Retained audit alias; no disconnected reporting authority. |
| `/workspace/admin/taxonomies` | P2 | Existing maintenance/moderation controls retained; shared form treatment. |
| `/workspace/admin/users` | P2 | Team/role administration retained; central guards preserved. |
| `/workspace/ads/attribution` | P2 | Canonical campaign attribution destination retained with migration notice. |
| `/workspace/ads/catalogue` | P2 | Canonical catalogue destination retained with migration notice; no duplicate authoritative catalogue. |
| `/workspace/ads/placements` | P2 | Clearly labeled legacy placement concept retained; no spend or campaign created. |
| `/workspace/analytics` | P2 | Shared lead/source/campaign/date cohorts and fictional cost provenance retained; no invented ROI/revenue. |
| `/workspace/billing` | P2 | Canonical plan, quota impact and local selection retained; control tower also shows the same usage. |
| `/workspace/billing/dunning` | P2 | Compatibility route displays the same selected-organization illustrative invoice ledger; no disconnected payment recovery state. |
| `/workspace/billing/invoices` | P2 | Organization-scoped illustrative ledger retained; no payment or settlement action. |
| `/workspace/billing/invoices/INV-2026-0419` | P2 | Illustrative document preview/recovery retained; no real invoice issued. |
| `/workspace/campaigns` | P2 | Canonical portfolio, status filters and creation retained; shared typography and controls improved. |
| `/workspace/campaigns/AQ-10233` | P2 | Unknown-ID recovery exercised. Populated campaign editor/approvals are separately captured by the campaign journey suite. |
| `/workspace/campaigns/new` | P1 | Guided canonical campaign creation retained; added a real navigation-pending state so a quick stage selection cannot be lost while opening the saved draft. |
| `/workspace/hub` | P2 | Scoped distribution overview retained; shared context and controls improved. |
| `/workspace/hub/connectors` | P2 | Retained directory alias; named providers and setup boundaries preserved. |
| `/workspace/hub/connectors/property-finder` | P2 | Setup prerequisites, local acknowledgement, mappings, feed/activity/diagnostics retained; readability and controls improved. |
| `/workspace/hub/feeds` | P2 | Canonical XML/JSON/CSV preview/download retained; no live feed endpoint. |
| `/workspace/hub/jobs` | P2 | Existing filter, inspector, retry/cancel and historical snapshots retained; empty action remains available. |
| `/workspace/hub/mappings` | P2 | Retained mapping/preview route and explicit contract limits; shared table polish. |
| `/workspace/hub/marketplace` | P2 | Existing provider/category search retained; stronger provider headings, body text and category controls. |
| `/workspace/inbox` | P2 | Linked split-pane conversations, opt-out guard and local reply/handover preserved; shared responsive controls. |
| `/workspace/integrations/ga4` | P2 | Consent-aware local event preview retained; no tag or analytics delivery. |
| `/workspace/integrations/google-ads` | P2 | Google planning and property campaign handoffs retained; no universal feed or external spend claim. |
| `/workspace/integrations/meta-catalog` | P2 | Canonical local catalogue, policy/approval and event preview retained; no Meta connection. |
| `/workspace/integrations/whatsapp` | P2 | Local preparation and CRM handoff retained; no credentials or messages sent. |
| `/workspace/inventory` | P1 | Added combined purpose/type/price filters, trimmed search, price-range validation, thumbnails, accessible view selection and no-match/empty recovery. |
| `/workspace/inventory/AQ-10233` | P2 | Canonical dossier, source/revision, resumable archive and bilingual content retained; shared table/type improvements. |
| `/workspace/inventory/AQ-10233/edit` | P1 | Added dirty indicator, sticky save actions, reload warning and accessible stay/discard link-navigation dialog. Failed save retains edits. |
| `/workspace/inventory/AQ-10233/enquiries` | P2 | Canonical property-linked CRM history and intake handoff retained; responsive table reviewed. |
| `/workspace/inventory/AQ-10233/media` | P2 | Persistent metadata, categories, native drag/keyboard ordering and local sample previews retained; larger controls. |
| `/workspace/inventory/AQ-10233/publishing` | P2 | Per-property publishing ledger retained; no remotely accepted status invented. |
| `/workspace/inventory/import` | P1 | Inert mapping action is consistently disabled with explanation, even after file selection; canonical creation remains available. |
| `/workspace/inventory/new` | P1 | Canonical draft creation retained; repeated-click guard during editor navigation. |
| `/workspace/leads` | P2 | Existing intake, table/pipeline, filters, owner/stage/qualification preserved; shared forms and tables reviewed. |
| `/workspace/leads/LE-2101` | P2 | Canonical lead dossier, notes, attribution, assignment and viewing actions preserved; shared control sizing. |
| `/workspace/leads/assignment` | P2 | Persistent round-robin/manual/fallback policy and membership availability retained; readable controls. |
| `/workspace/leads/viewings` | P2 | Lead-linked local booking, conflict checks and status transitions retained; schedule also visible on control tower. |
| `/workspace/notifications` | P1 | Unrelated static notifications replaced with selected-organization jobs, leads and campaign-review activity; read markers explicitly last for this view only. |
| `/workspace/organization` | P2 | Canonical selected-organization profile retained; compact context and clearer forms. |
| `/workspace/organization/new` | P2 | Independent empty organization onboarding retained; clear shared selector and responsive forms. |
| `/workspace/publish` | P2 | Canonical selection, per-destination validation, revision-bound local approval, queue and results retained; readable controls. |
| `/workspace/settings` | P2 | Shared organization settings and local preferences retained; readable form controls. |
| `/workspace/settings/domains` | P2 | Brand/reserved-domain draft and checklist retained; no DNS/TLS claim. |
| `/workspace/settings/domains/preview` | P2 | Selected organization’s canonical portfolio retained, including empty organization state. |
| `/workspace/settings/privacy` | P2 | Explicit request preview retained; no personal-data export/deletion performed. |
| `/workspace/studio` | P2 | Six-stage source/facts/media/bilingual/review/handoff retained; shared type/forms improved. No extraction or model claimed. |
| `/workspace/support/assistant` | P2 | Selected-organization keyword-only playground retained; no AI inference claimed. |
| `/workspace/support/evaluations` | P2 | Targets versus actual evaluation count remain distinct; no model test results invented. |
| `/workspace/support/knowledge` | P2 | Explicit knowledge lifecycle examples retained; readable shared table. |
| `/workspace/team` | P2 | Membership invitation/status/roles and permissions demo retained; table/control sizing reviewed. |
| `/workspace/verification` | P2 | Fictional business/license submission retained; no identity verification inferred. |
| `/workspace/whatsapp/packs` | P2 | Selected canonical property/media/language pack and empty state retained; no send action. |
| `/workspace/whatsapp/sla` | P2 | Compatibility route uses the same canonical inbox and local handover actions with a primary-workflow notice. |
| `/workspace/whatsapp/templates` | P2 | Explicit template lifecycle examples retained; no actual provider approval inferred. |

## Requirements changed

GEM-01 (context/navigation/access preview), GEM-02 (inventory, creation, dirty/save recovery), GEM-03 (explicit new Arabic copy and RTL), GEM-04 (media/control presentation), GEM-05–08 (readable setup/validation and dashboard handoffs), GEM-13–15 (canonical enquiry/viewing readouts), GEM-17 (public platform/agency presentation), GEM-18/19 (shared quota readout, illustrative terms unchanged), GEM-20 (derived local activity and existing administration), GEM-21 (Studio/campaign presentation and truthful simulation), GEM-22 (all-route four-width review), GEM-24 (existing shared analytics retained). GEM-23 production status is unchanged. No future-backend tasks were added.

## Verification and evidence

| Check | Result / evidence |
|---|---|
| `CI=true pnpm install --frozen-lockfile` | Passed; 382 locked packages reused/installed. Restricted DNS/offline attempts needed a network-enabled retry; [recorded install summary](../artifacts/frontend/logs/install-summary.txt) |
| `pnpm typecheck` | Passed; [log](../artifacts/frontend/logs/typecheck.log) |
| `pnpm lint` | Passed with no warnings; [log](../artifacts/frontend/logs/lint.log) |
| `pnpm build` | Default Turbopack failed at sandbox process/port binding (`Operation not permitted`); [separate default-build log](../artifacts/frontend/logs/build-default.log) |
| `pnpm --dir apps/web exec next build --webpack` | Supported fallback passed, including production compilation/type checking and static generation; [log](../artifacts/frontend/logs/build-webpack.log) |
| `pnpm --dir apps/web test:e2e --reporter=list,json,html` | Full suite: **811 passed, 33 intentional skips, 0 failed/flaky**; [log](../artifacts/frontend/logs/e2e-full.log), [machine-readable results](../artifacts/frontend/logs/e2e-results.json) |
| Final copy-only followup: `test:e2e frontend-polish.spec.ts connector-hub.spec.ts final-copy.spec.ts final-visual.spec.ts --reporter=list,json,html` | **72 passed, 4 intentional skips, 0 failed** on the final localized build; includes all-route WCAG scans, export integrity and desktop/mobile/Arabic controls; [log](../artifacts/frontend/logs/e2e-copy-followup.log) |
| `node scripts/frontend-review.cjs after` | Final matrix: **83 templates × 2 languages × 4 widths = 664 actual captures**, zero route/console/image-load/whole-page overflow issues; [route report](../artifacts/frontend/logs/after-routes.json) |
| Axe WCAG A/AA | 472 recorded scan states across 20 reports, **0 violations**. All-route main-content + shared-shell scans (336 states) refreshed after the copy followup. Automated evidence is not certification |
| `git diff --check` | Passed; no commit/push/deployment |

Playwright runs use `PLAYWRIGHT_PRODUCTION=1`, `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'` and `MAXPRO_EVIDENCE_ROOT=artifacts/frontend/regression`. Skips avoid duplicate viewport evidence or apply only to desktop/mobile-specific interactions (for example native drag versus mobile keyboard reorder). No existing feature was removed to make a check pass.

The full suite passed before the final presentation-only Arabic catalogue/requirement-label corrections. The targeted 72-test followup, including all-route accessibility/copy checks, and the refreshed four-width matrix validate those final corrections. Earlier failures and fixes are retained in separate logs; results are not silently relabeled as passing.

Open the [local screenshot gallery](../artifacts/frontend/index.html), [screenshot manifest](../artifacts/frontend/screenshot-manifest.json), [visual review](../artifacts/frontend/visual-review.md) or [contact sheets](../artifacts/frontend/contact-sheets). The manifest contains 914 full-page baseline/final captures (250 baseline + 664 final), with separate populated workflow regression captures and four unsaved-dialog captures. The gallery displays real PNGs and allows screen/language/viewport/before–after selection.

Representative final running-app captures:

- [Control tower · EN desktop](../artifacts/frontend/after/1440-en-workspace.png) / [AR mobile](../artifacts/frontend/after/375-ar-workspace.png)
- [Inventory · EN desktop](../artifacts/frontend/after/1440-en-workspace-inventory.png) / [AR mobile](../artifacts/frontend/after/375-ar-workspace-inventory.png)
- [Listing Studio · AR mobile](../artifacts/frontend/after/375-ar-workspace-studio.png)
- [Publishing · EN desktop](../artifacts/frontend/after/1440-en-workspace-publish.png) / [AR mobile](../artifacts/frontend/after/375-ar-workspace-publish.png)
- [Connector directory · EN desktop](../artifacts/frontend/after/1440-en-workspace-hub-marketplace.png)
- [CRM · EN desktop](../artifacts/frontend/after/1440-en-workspace-leads.png) / [AR mobile](../artifacts/frontend/after/375-ar-workspace-leads.png)
- [Populated campaign approval](../artifacts/frontend/regression/regression/phase4/screenshots/en-1440-approval.png) / [Arabic mobile approval](../artifacts/frontend/regression/regression/phase4/screenshots/ar-375-approval.png)
- [Arabic mobile unsaved dialog](../artifacts/frontend/interactions/mobile-chromium-ar-unsaved-dialog.png)
- [Public platform](../artifacts/frontend/after/1440-en-solutions.png) / [Arabic property search · mobile](../artifacts/frontend/after/375-ar-properties.png)


The default Turbopack build is separately reported from the supported Webpack production build. Browser checks use the installed Google Chrome executable because the locked Playwright package expects a bundled Chromium revision absent from this machine. This is Chromium desktop/mobile emulation, not physical-device/Safari/Firefox certification. Earlier failed development runs and first-pass visual findings remain in logs; only final verified results count as acceptance evidence.

## Arabic, responsive and accessibility status

All new interface copy has explicit Arabic presentation. Root `lang`/`dir`, logical layout, preserved provider/source values, bilingual fields and mirrored directional workflow actions remain. Selected organization/persona controls work in both locales. Tables retain focusable horizontal scrolling inside the page; this is intentional and must not be confused with whole-page overflow.

Professional Arabic review remains required: terminology, grammar, idiomatic labels, source-field direction, long text, localized dates and natural navigation. Fictional aliases, provider names, IDs, schemas and user-entered source text intentionally retain their original form. No full Arabic certification or WCAG conformance certification is claimed.

## Remaining frontend and stakeholder decisions

- Human design acceptance and native-speaker Arabic signoff remain open. The installed independent Claude Code reviewer returned “Not logged in”; see [review log](../artifacts/frontend/logs/independent-review.log). Implementation self-review and test results do not satisfy the independent reviewer requirement.
- Final MaxPro/AqarPro identity, logo and licensed Qatar/GCC property imagery remain stakeholder decisions. Bundled photographs are fictional stock fixtures and do not prove property ownership/location/rights.
- Public showcase launch scope, approved commercial tiers/quotas and final legal copy remain unapproved. The illustration QAR 179 / 725 / 1,800+ is unchanged and is not a purchase offer.
- Local unsaved-change confirmation protects canonical editor anchor navigation; the native browser warning covers document unload. Other forms retain their explicit save/resume flows. Browser history and organization/persona switching are outside the custom dialog's interception scope.
- Notification read markers and secondary saved research remain view-local and are labeled accordingly. File import, secure uploads/processing, AI inference, real messaging, booking invitations, partner dispatch/acknowledgements, billing and DNS remain unavailable previews under this frontend-only milestone.
- PWA install/offline behavior and physical-device/cross-browser UAT remain separate frontend acceptance work. No service-worker implementation is claimed.

The result is a frontend review candidate. Stakeholder design approval, native Arabic review and independent review are not inferred from generated screenshots or passing tests.
