# Phase 10 — enterprise SaaS UX redesign

Baseline: `bed59052cce89cc219d3f851cd5498c4d5e82b8d`, matching the supplied brief. [OpenSpec 0014](../openspec/changes/0014-enterprise-saas-ux/proposal.md). Frontend-only fictional prototype; existing canonical commands remain authoritative. AqarPro logo and MaxPro working name are preserved pending brand approval.

## Prioritized baseline issues

| Severity | Route/control | Before | Desired behavior / evidence |
| --- | --- | --- | --- |
| P1 | Publish/campaign property, agency entry, agent assignment | Unsearchable native portfolio/people lists; property titles truncate without ID/location context | Search by title, ID or location; keyboard/manual commit; bounded popup. `before/inventory.json` inventories actual controls. |
| P1 | Shared CSS | 226 KB historical cascade with repeated selectors and control overrides | Semantic ownership, shared appearance and verified dead-rule removal. |
| P1 | Property wizard purpose / actions | Binary purpose hidden in dropdown; basic facts extend below initial viewport; dock must remain usable | Visible radio choices; compact consistent sections; reserve dock space and inspect scrolled focus. [Before editor](../artifacts/phase10/before/en-1440-workspace-inventory-AQ-10233-edit.png). |
| P2 | Campaign editor | Serif stage titles and exposed technical role controls compete with the operational form | Shared hierarchy and contextual demo tools. [Before](../artifacts/phase10/before/en-1440-workspace-campaigns-new.png). |
| P2 | CRM filters | Full seven-control block competes with records; property filters show IDs without context | Compact common fields, meaningful labels and searchable portfolio context. [Before](../artifacts/phase10/before/en-1440-workspace-leads.png). |
| P2 | Inventory / shell | Repeated Add property action in header and page; sort 40px vs 44px fields | One contextual primary action, consistent dimensions; a dedicated narrow-screen sort/view row prevents a clipped selected sort label. |
| P2 | Settings | Repeated large cards for simple destinations | Grouped management rows and distinct advanced demo tools. |
| P2 | All routes / short controls | Team selects 38px, sort 40px, mixed chevrons and typography | One native select appearance with logical padding and 44px height. |
| P2 | Source cleanup | Unreachable legacy dashboard/analytics implementations remain alongside canonical routes | Remove confirmed dead modules; retain documented contracts, fixture history and public compatibility. |

Baseline: **162 real-app captures, zero document-overflow findings**, covering all 66 agency route templates in both locales plus core mobile views. This does not establish open-control accessibility. Open portal preparation and Arabic assistance were separately interacted with and captured. Machine-readable names, option values, counts and dimensions are in [baseline inventory](../artifacts/phase10/before/inventory.json).

## Selection decisions

| Choice | Pattern | Reason |
| --- | --- | --- |
| Organization type, country | NativeSelect | Three familiar options; native mobile behavior |
| Agency entry/switch, property selection, agent assignment | SearchCombobox | Portfolio/directory can grow; stable IDs, useful descriptions |
| Rent/sale | Segmented native radios | Two choices visible without opening a menu |
| Type, furnishing, rental frequency, property state | NativeSelect | Short controlled vocabulary |
| City/district | TextField | No approved exhaustive location catalogue; preserve existing facts, no invented location list |
| Media room/category | NativeSelect | Short room list, per-image label |
| Portal/ad/message destinations | Checkbox cards | Multiple channels, selected count and individual preparation |
| Campaign objective/platform, CRM stage, filters | Shared native select or radios where useful | Bounded known options; existing state machines preserved |
| Billing plan | Existing plan cards + NativeSelect preview | Explicit local change preview, no checkout |
| Advanced workbenches | NativeSelect | Compatibility and engine regression behavior retained |

Guidance reviewed: [GOV.UK selects](https://design-system.service.gov.uk/components/select/), [WAI-ARIA combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/), [Atlassian spacing](https://atlassian.design/foundations/spacing), [WCAG 2.2 focus not obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum). The implementation uses these interaction and spacing principles while retaining the approved visual direction.

## Design-system architecture and implemented changes

`globals.css` is now an import entry point. `styles/tokens.css` owns colors, semantic type sizes, spacing, control dimensions, radii, focus, navigation and overlay values. `foundations.css` owns reset, typography, surfaces and shared composition; `layout.css` owns the app shell. `components/{buttons,fields,selection,tables,overlays,navigation}.css` own common appearance and interaction states. `workflows/{properties,promotion,crm,campaigns,organization,integrations}.css` own task composition. `public.css` retains the secondary public experience. Files are grouped by responsibility rather than historical phase. Base rules precede feature layouts and shared control owners.

Typed components in `components/ui` have real consumers: Button, FieldWrapper/feedback, TextField, TextArea, NativeSelect, SegmentedControl and SearchCombobox. Existing Intro, Section, Pill, assistance modal and draft-protection dialog remain canonical. No dependency or second component library was added. NativeSelect is adopted across every retained native-select call site. Property search is used in Publish & Promote and campaign creation; agency entry and agent assignment use the same search interaction.

Traceability: GEM-01 (agency context/team), GEM-02–04 (property forms, bilingual content and media), GEM-05–08/10/11 (channel preparation and local approval/simulation), GEM-12–16/24 (measurement, CRM, assignment, viewings, messaging and attribution preserved), GEM-17 (showcase compatibility), GEM-18/19 (illustrative plans/entitlements), GEM-21/22 (reviewed deterministic assistance and responsive UX). GEM-09/20 advanced compatibility is retained. GEM-23 remains entirely unimplemented; there is no new backend roadmap or production-security claim.

- The dashboard states actual draft/enquiry counts, gives Add property the primary treatment and places new enquiries beside drafts. Channel follow-up and viewings remain below. Empty states use the same canonical data.
- The wizard uses visible rent/sale radios, common fact fields, local inline validation and the existing reserved action dock. Incomplete zero-price drafts remain savable. Photos, revision checks, optional contextual assistance and per-channel readiness reuse their working implementations.
- Promotion keeps its property and goal context, explicit channel selection count and one provider configuration at a time. Property search uses title, ID and district/city; changing property still goes through the existing dirty-draft guard. Approval/queue/provider distinctions are unchanged.
- The campaign editor now uses the operational sans-serif hierarchy, a clear form surface, shared fields and searchable canonical property choice. The fictional review-role control remains available in a labelled disclosure. Its commands and approval sequence are unchanged.
- Campaign, property and promotion screens share the existing human-facing status labels through the lightweight `lib/campaign-presentation.ts`; raw state-machine keys are no longer shown in primary promotion/property badges.
- CRM assignment and handover share searchable available/disabled agents and explicit clearing. Property filters include property titles with IDs. Reset sits with quick filters, reducing space above the records. Inbox retains the linked property, source-grounded reply inspector, local composer and consent guards.
- Settings uses a single grouped management list with icons and descriptions. Advanced demo controls remain separate. Billing keeps existing illustrative plan cards, usage, limits and local plan-change preview; no checkout exists.
- The six-section shell retains persistent 248/72px desktop navigation, its 64px header, focus tooltips, inert mobile background, modal dismissal and focus restoration. Inventory no longer repeats the Add property action in the topbar. Approved logo assets are unchanged.

## Dependency-aware cleanup

The [removed-code manifest](../artifacts/phase10/cleanup-manifest.json) records file/export removals and classifications. The [source graph](../artifacts/phase10/source-audit.json) is reproducible with `node scripts/enterprise-source-audit.cjs`.

| Classification | Decision |
| --- | --- |
| DEAD — `prototype/overview.tsx`, `prototype/relationships.tsx`, `lib/brand.ts` | Removed after route/import/test/tool/document reference checks. Canonical dashboard, hub, CRM, analytics and approved logo remain. Historical CRM documentation reference annotated. |
| DEAD — `Metric`, `ListingRow`, `MiniBars`, `buttonClass`, `FinanceOps`, `InventoryEditor` | Removed unreferenced exports and their unused imports. Dunning/invoice routes already use canonical InvoiceWorkspace. |
| ACTIVE | Canonical engines, local repository/schema, media/brand assets and all runtime/build dependencies retained. |
| COMPATIBILITY | Public showcase and existing advanced/legacy deep links retained. |
| TEST SUPPORT | All existing tests retained; control interactions changed where the UI became searchable or disclosed. Business assertions remain. |
| DOCUMENTED | `api-contracts.ts`, original `demo-data.ts`, generator alias `utils.ts`, historical screenshot/log trees retained. |
| UNCERTAIN | Unreferenced translation keys retained because runtime source text and tests may reuse them; no speculative deletion. |

CSS parsing removed 157 exact shadowed declarations and source-unreferenced selector branches, with a second check after dead-module removal. The full [CSS manifest](../artifacts/phase10/css-cleanup.json) lists decisions. Runtime-generated Lucide arrow selectors were restored after RTL visual review; source absence alone was not accepted as proof for generated classes. Shared field appearance replaces competing select-specific fonts, borders, padding and chevrons. This is a focused cleanup, not a claim that every unused export or translation has been eliminated. Historical generated directories were reviewed separately and retained to preserve acceptance evidence.

Final syntax counts: **2,814 → 2,235 rules**, **8,034 → 6,067 declarations**. Combined, readable style sources are **225,465 → 213,727 bytes**; the improvement is semantic ownership and less conflicting CSS, rather than an artificial reduction obtained by moving an unchanged file. An older productivity test's hard-coded Phase 9 capture path was made evidence-root-aware, and 94 overwritten historical captures were restored to their initial committed bytes. The final diff contains no changes to historical artifact trees.

## Review and verification notes

The independent read-only review required by AGENTS.md found short-viewport popup clipping, anchoring to the narrow input, zoom geometry and TextArea loading handling. These were repaired, and the acceptance tests expanded to cover open 320×300 popups, long scrolling portfolios and popup bounds at 200% CSS zoom. The reviewer confirmed the short-viewport fix and found no domain-engine/schema change. Final verification results and screenshot links follow below.

The first complete regression recorded 888 passed, 37 skipped and three failures: a before-paint popup measurement race and the EN/AR 768px showcase grid. Popup positioning now measures in `useLayoutEffect`, reveals the focused input before measuring after keyboard-sized resizes, and anchors upward filtered lists by their actual height. Property-card responsive rules now live with their base rules; images cannot exceed their columns. Assertions remain strict. The separate reviewer checked the final repairs and reported no further concrete defect. [Review record](../openspec/changes/0014-enterprise-saas-ux/review.md).

Two later closing runs recorded 890/887 passes, 37 skips and 1/4 timeouts. One timed-out test reported 15 minutes despite a 60-second limit, suggesting a host scheduling interruption; the cause was not established. Its snapshot showed the restricted admin-integrations page rendered, and that route passed all six independent desktop/mobile repetitions in 1.9 seconds. [Focused recheck](../artifacts/phase10/route-recheck.log). The final full run used `caffeinate -i -s` to prevent idle system sleep and passed in 3.0 minutes without source, assertion or timeout changes. Earlier logs remain in `artifacts/phase10/development`.

## Actual final verification

| Command / check | Result |
| --- | --- |
| `CI=true pnpm install --frozen-lockfile` | Passed with escalation after sandbox registry resolution failed; lockfile unchanged. Existing package policy skips optional `@parcel/watcher` / `@swc/core` install scripts. [Log](../artifacts/phase10/install.log). |
| `pnpm typecheck` | Passed. [Log](../artifacts/phase10/typecheck.log). |
| `pnpm lint` | Passed. [Log](../artifacts/phase10/lint.log). |
| `pnpm build` | Failed at the documented sandbox restriction: Turbopack/PostCSS cannot bind a worker port, `Operation not permitted`. [Actual failure](../artifacts/phase10/build-default.log). |
| `pnpm --dir apps/web build --webpack` | Passed; supported Next.js production build. [Log](../artifacts/phase10/build-webpack.log). |
| `pnpm --dir apps/web test:e2e --timeout=60000 --trace=off` | **891 passed, 37 expected skips, 0 failures** (928 total). All prior tests retained; 24 new EN/AR desktop/mobile control cases. [Full log](../artifacts/phase10/playwright-full.log). |
| Full-route axe | Four reports × 86 page/document checks = **344 checks, zero violations**. Open-combobox WCAG 2.2 checks also passed. [Reports](../artifacts/phase10/regression/logs). |
| Final six-width browser matrix | **284 route/viewport captures**, zero document-overflow findings and zero visible native selects below 44px. EN/AR at 1440/1280/1024/768/375/320. [Inventory](../artifacts/phase10/after/inventory.json), [log](../artifacts/phase10/visual-matrix.log). |

Final browser runs use the completed production server on port 3210, `PLAYWRIGHT_PRODUCTION=1`, installed headless Chromium 145, and `MAXPRO_EVIDENCE_ROOT=artifacts/phase10/regression`. The full-suite and screenshot commands are prefixed with `caffeinate -i -s` on this macOS host. Chrome 157 was also used for baseline/interactive review. The longer timeout accommodates host load; tracing is off to avoid recording overhead. Screenshots, console/hydration-error guards, assertions and accessibility checks remain enabled. The 37 skips are retained duplicate-project/viewport cases. Interrupted development runs are not included in final counts.

## Real before/after evidence

| Screen | Before | After |
| --- | --- | --- |
| Dashboard | [1440px](../artifacts/phase10/before/en-1440-workspace.png) | [1440px](../artifacts/phase10/after/en-1440-workspace.png) |
| Inventory | [1440px](../artifacts/phase10/before/en-1440-workspace-inventory.png) | [1440px](../artifacts/phase10/after/en-1440-workspace-inventory.png) |
| Arabic mobile editor | [375px](../artifacts/phase10/before/ar-375-workspace-inventory-AQ-10233-edit.png) | [375px](../artifacts/phase10/after/ar-375-workspace-inventory-AQ-10233-edit.png) |
| Property workspace | [1440px](../artifacts/phase10/before/en-1440-workspace-inventory-AQ-10233.png) | [1440px](../artifacts/phase10/after/en-1440-workspace-inventory-AQ-10233.png) |
| Publish & Promote | [375px](../artifacts/phase10/before/en-375-workspace-publish-property-AQ-10233.png) | [375px](../artifacts/phase10/after/en-375-workspace-publish-property-AQ-10233.png) |
| Campaign editor | [1440px](../artifacts/phase10/before/en-1440-workspace-campaigns-new.png) | [1440px](../artifacts/phase10/after/en-1440-workspace-campaigns-new.png) |
| CRM | [1440px](../artifacts/phase10/before/en-1440-workspace-leads.png) | [1440px](../artifacts/phase10/after/en-1440-workspace-leads.png) |
| Settings | [1440px](../artifacts/phase10/before/en-1440-workspace-settings.png) | [1440px](../artifacts/phase10/after/en-1440-workspace-settings.png) |

[Open Arabic combobox](../artifacts/phase10/interactions/mobile-chromium-ar-combobox-open.png), [search result](../artifacts/phase10/interactions/chromium-en-combobox-search.png), [Arabic review inspector](../artifacts/phase10/after/ar-375-assistance-open.png), [selected portal](../artifacts/phase10/after/en-375-channel-open.png) and [populated creative review](../artifacts/phase10/regression/regression/phase4/screenshots/en-1440-creative.png) provide interaction evidence. The full manifest covers **450 baseline/final screenshots**, plus workflow/interaction captures in the regression directories. [Manifest](../artifacts/phase10/screenshot-manifest.json), [contact sheets](../artifacts/phase10/contact-sheets).

All final contact sheets were inspected for hierarchy, matching controls, RTL, margins, clipping and responsive composition; major forms and open overlays were also inspected at full resolution. Restricted platform routes are captured in the agency persona; role-specific platform forms have their separate retained regression coverage. Unknown campaign IDs intentionally exercise recovery, while populated campaigns are captured by the workflow suite. Open overlays use viewport captures to avoid full-page sticky-element screenshot artifacts.

Professional Arabic completion, native-speaker UAT, physical mobile keyboards, Safari/Firefox and assistive-technology testing remain prerequisites for broader accessibility approval. Chromium emulation and axe do not establish complete WCAG certification. Real authentication, secure tenant isolation, provider delivery, AI inference, spending, billing and Frappe remain unimplemented.

No commit, push or deployment was performed. No product-scope conflict was introduced.
