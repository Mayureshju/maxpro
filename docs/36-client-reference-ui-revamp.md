# Phase 15 — client-reference UI revamp

Baseline `342786068bee2b15c6890632768988b14852a5be`; [OpenSpec 0019](../openspec/changes/0019-client-reference-ui-revamp/proposal.md). Frontend-only. The Phase 15 instruction explicitly supersedes earlier requirements to preserve stone/eucalyptus styling. Business logic, future Frappe boundary and fictional-data disclosures remain authoritative.

## Direct reference comparison

Inspected https://maxpro-one.vercel.app/en in installed Chromium on 17 November 2026. [Recorded observations](../artifacts/phase15/reference/observations.json), [sampled styles](../artifacts/phase15/reference/styles.json). Homepage, registration, advertiser dashboard and its Listings/Leads/Billing/Team/Verification tabs, classic creation, AI Studio, Portal Hub, Meta promotion and WhatsApp simulation were directly inspected in EN/AR desktop/mobile. `/properties` and `/properties/AQ-10233` return HTTP 404 in the reference; no property-discovery/detail design is inferred from them. No standalone reports/settings route was exposed in the observed reference navigation. No separate 3 November report or UAT screenshots were supplied; the brief's historical C1–C6 summary is the only supplied report evidence.

| Area | Reference observation | Current baseline / redesign decision |
| --- | --- | --- |
| Identity/color | Forest hero, vivid #13873f CTAs, white rounded surfaces | Replace stone/brown/eucalyptus with shared emerald/forest/white system |
| Navigation | Services, How it works, Portals, Pricing | Consolidate feature links under Platform; retain six agency sections and advanced compatibility |
| Typography | Manrope with IBM Plex Sans Arabic; sans headings | Replace public Georgia and inconsistent fallbacks with self-hosted matching families |
| Spacing/proportions | Compact 64px header, bounded page width, purposeful panels | Reduce oversized public gaps; bound Quick Add; bring agency summary above daily work |
| Forms/selections | Clean white fields, visible stepped tasks | Retain reliable native/select/search/radio semantics; improve spacing, borders and selection contrast |
| Dashboard | Four compact metrics, clearly titled white panels | Use actual local properties/enquiries/actions/channel/viewing counts; never copy reference view/tendency claims |
| Property workflow | Classic form and separate AI Studio visible | Preserve newer unified canonical editor, review and media safeguards with guided stage styling |
| Publishing | Hub, per-portal checks/jobs/history | Keep distinct portal/ad/direct journeys and repair links; improve channel visibility/status hierarchy |
| CRM | Lead tab and WhatsApp workspace observed | Keep newer linked lead/inbox/assignment/consent workflow; unify table and conversation surfaces |
| Mobile | Reference reflows forms/cards; assistant fixed at bottom | Use existing modal drawer and bounded contextual assistance; inspect all six widths |
| Arabic | Real RTL and Arabic companion font in reference | Use IBM Plex Sans Arabic throughout controls too; inspect logical placement and wrapping; professional review still needed |
| Feedback | Selected green tabs, action emphasis, rounded controls | Preserve local save/validation/approval feedback with consistent semantic colors/focus/motion |

The reference feels easier to scan because its primary actions have stronger contrast, headings use one readable family, navigation exposes fewer first-level decisions, and each panel has an obvious purpose. These are evaluator observations, not participant usability research. Its mock portal capabilities, metrics and historic failed C3 behavior are excluded from the implementation.

## Evidence and verification

Baseline: [108 actual screenshots](../artifacts/phase15/before/audit.json), EN/AR at all six requested widths for the three representative screens and desktop/phone across the other modules; zero document-overflow findings. Final screenshots: [252 route/viewport records](../artifacts/phase15/after/audit.json), 21 screens × two locales × six widths, zero HTTP errors or document-overflow findings. All 12 [contact sheets](../artifacts/phase15/contact-sheets) were visually inspected; forms, selected channels and open dialogs received full-resolution inspection. These are Chromium emulations and evaluator observations, not participant UAT.

## Shared design and composition

Manrope is locally hosted as a variable English UI family; IBM Plex Sans Arabic has regular and semibold sources for Arabic, including fields and controls. [Font sources and OFL licenses](../apps/web/public/fonts) come from Google Fonts' official repository. There is no runtime font-service request. Body/control text uses 15–16px where appropriate, labels 13–14px, workspace page headings 28–34px, public headings 32–52px. Repeated page overlines were removed because the workspace already has breadcrumbs. Arabic uses its own line-height and zero tracking.

| Token role | Value | Decision |
| --- | --- | --- |
| Functional emerald | `#107a38` | Adapted from directly sampled reference `#13873f`; white-on-action 5.44:1 and green-on-selected-background 4.95:1 |
| Forest | `#062b22` | Brand hero/entry surfaces; reference hero sampled `#03140f` |
| White / canvas / selected | `#ffffff` / `#f5f9f7` / `#e9f8ee` | Clear content areas and quiet supporting surfaces |
| Text / secondary text | `#14231c` / `#52675c` | 16.32:1 on white / 5.73:1 on canvas |
| Spacing / controls | 4/8/12/16/24/32/48px; 44px workspace controls | Existing native/search/radio semantics retained |
| Radii | 8px controls; 10–14px panels | Rounded white surfaces with restrained borders and shadows |

[Calculated contrast evidence](../artifacts/phase15/contrast.json). The exact reference green produced 4.19:1 on the selected pale background, so copying it unchanged would fail small-text contrast. Existing warning/error/info semantics remain distinct. Reduced-motion preferences disable entrance and transition effects.

The homepage has a forest split hero with real editor evidence, four-link primary navigation, a keyboard-operable product preview, concise workflow, property/assistance/channel explanations, agency benefits, canonical illustrative pricing, FAQ and final CTA. The header groups feature/agency pages under Platform while How it works, Integrations and Pricing remain direct. Account entry uses the same system without developer persona selection.

The dashboard now brings five record-derived summaries above the daily work and adds recent properties beside recent activity. No reference views, growth rates or ROI figures were copied. Quick Add uses a bounded form with desktop two-column essentials, mobile single-column flow and a next-steps companion. The existing editor's four guided stages, review summary, scrolling region and safe-area actions remain. Inventory retains readable mobile records and visual grid alternative. Portal/ad/direct choices have clear selected surfaces; current property, inline repair actions, approvals and outcomes remain visible. CRM/inbox, campaigns, performance, settings, billing, media and advanced compatibility screens inherit the same typography, controls, status colors and surfaces.

## Functional repair: actual canonical sharing previews

The audit found that new `DEMO-<uuid>` sharing links reached a server 404, while seeded AQ links showed the static catalogue even after canonical edits. Sharing now explicitly links to `?preview=local`; new UUID drafts also resolve directly. The preview hydrates the same selected-organization local repository, uses its saved facts/media, permits local enquiry preparation and links into the existing guarded WhatsApp-preparation workflow. It does not send, store an enquiry, publish a listing or expose another organization's property. Unknown/archived/other-organization drafts show an explicit recovery state. Normal sample catalogue URLs remain independent fictional examples. Arabic public search now includes Arabic titles and translated locations.

## Page and component inventory

[All 92 page files](../artifacts/phase15/route-inventory.json) were inventoried; none was deleted. Shared style ownership remains in `styles/{tokens,foundations,layout,marketing,public}.css`, `styles/components/*` and `styles/workflows/*`. Existing Button/Field/NativeSelect/SearchCombobox/SegmentedControl, Intro/Section/Pill, assistant and draft-protection dialogs remain the component vocabulary. No second UI library or package dependency was added.

| Group | Updated surfaces / retained behavior |
| --- | --- |
| Public | Home, platform/agency/features, walkthrough, integrations, pricing, FAQ/contact/about/resources; secondary discovery/detail/favorites/compare/saved-search/map/agency/legal routes |
| Entry / shell | Registration, fictional-agency selection, six-section navigation, persistent collapse, mobile drawer, breadcrumbs, language/account controls |
| Properties | Inventory list/grid/filter/sort, Quick Add, four-stage editor, advanced editor, media, details/sections, enquiries, publishing history, import/export |
| Publish & Promote | Property/goal/channel selection, setup, content, review, local outcomes, portal history; distinct portal, advertising and direct-sharing engines |
| Customer work | Leads/table/pipeline/detail, Inbox/composer, assignment, viewings, WhatsApp packs/templates; deterministic assistance with source/edit/accept/dismiss |
| Remaining operations | Campaign portfolio/editor/approvals, Meta/Google planning, analytics, billing/invoices, settings/profile/team/branding/domains/privacy and privileged compatibility pages |

164 previous root style rules were replaced in their semantic owners, with palette/type consolidation across all 16 style files. [Replacement manifest](../artifacts/phase15/css-components.json), [palette refactor](../artifacts/phase15/style-refactor.json). Structural rules for dialogs, editor actions, channel choices, CRM and public cards were separately reviewed and restored where required; [repairs](../artifacts/phase15/structural-review-repairs.json). No uncertain domain or compatibility code was removed. The exact-duplicate cleanup audit found no additional safe deletion after the replacements; this is not a claim that all historical CSS is dead-free. A temporary Next-generated `apps/web/AGENTS.md` was removed from the final diff; no repository instruction changed.

All 40 overview/mobile marketing screenshots, 30 detail crops and four mobile task screenshots were refreshed from the running redesigned workspace. [Overview provenance](../apps/web/public/product/product-provenance.json), [crop/source hashes](../apps/web/public/product/detail-provenance.json). No generated illustration substitutes for a rendered page. Historical evidence trees are preserved; the daily-audit test now respects the selected evidence root.

## Before / after review

| Screen | Before | After |
| --- | --- | --- |
| Homepage | [Desktop](../artifacts/phase15/before/en-1440-home.png) | [Desktop](../artifacts/phase15/after/en-1440-home.png), [Arabic phone](../artifacts/phase15/after/ar-320-home.png) |
| Dashboard | [Desktop](../artifacts/phase15/before/en-1440-dashboard.png) | [Desktop](../artifacts/phase15/after/en-1440-dashboard.png), [Arabic phone](../artifacts/phase15/after/ar-375-dashboard.png) |
| Quick Add | [Desktop](../artifacts/phase15/before/en-1440-quick-add.png) | [Desktop](../artifacts/phase15/after/en-1440-quick-add.png), [Phone](../artifacts/phase15/after/en-375-quick-add.png) |
| Property editor | [Desktop](../artifacts/phase15/before/en-1440-editor.png) | [Desktop](../artifacts/phase15/after/en-1440-editor.png), [Arabic phone](../artifacts/phase15/after/ar-320-editor.png) |
| Publishing | [Desktop](../artifacts/phase15/before/en-1440-publish.png) | [Desktop](../artifacts/phase15/after/en-1440-publish.png), [Arabic](../artifacts/phase15/after/ar-1440-publish.png) |
| Inbox | [Phone](../artifacts/phase15/before/en-375-inbox.png) | [Phone](../artifacts/phase15/after/en-375-inbox.png) |
| Settings | [Desktop](../artifacts/phase15/before/en-1440-settings.png) | [Desktop](../artifacts/phase15/after/en-1440-settings.png) |

`before` and `after` include the three representative screens at all six widths; the final set extends every recorded module to all six. Marketing assets were refreshed after the initial representative inspection. Open-state evidence is recorded separately in [interactions](../artifacts/phase15/interactions).

## UAT safety audit and requirements

The historical C1–C6 outcomes are not reasserted as current defects or current participant results. Canonical engines and `demo-provider.tsx` are unchanged. Existing regression assertions remain authoritative; UI selectors changed only for intentional navigation/image composition and asset-load readiness.

| Historical scenario | Current boundary / regression evidence |
| --- | --- |
| C1 property assistance | Existing saved-catalogue search and deterministic source-grounded proposals; Accept/Edit/Dismiss and stale-source tests remain. No model connection or generated property matches. |
| C2 property pack | Existing canonical media/pack preparation and consent-aware CRM; canonical preview now gives a valid entry into WhatsApp preparation. No message delivery. |
| C3 subscribe/pay/publish | Shared source/media/review/owner/permit/connector/quota checks retained in domain commands; billing is illustrative, no card collection or gateway. Production legal/permit policy remains stakeholder-owned. |
| C4 Studio → portals | Same canonical property path, revision-bound approvals, independent destination validation, retry/deduplication/cancellation coverage retained. Local queue is never external acceptance. |
| C5 Meta promotion | Existing ordered policy/advertiser/optional admin approval, budget caps and invalidation tests retained; no actual spend or campaign success claim. |
| C6 reporting/handover | Existing CRM consent/STOP/assignment/handover remains; no seeker-report domain command exists to expose through a new public control. Do not infer one from the historical missing entry. |

Traceability: GEM-01–08/10/11/13–19/21/22/24 have direct visual/journey work. GEM-09/12/20 advanced compatibility is preserved. GEM-23 remains entirely unimplemented. No production authentication, secure tenant isolation, Frappe application, backend/database, vendor adapter or external transport was added.

## Final verification

| Command / check | Actual result |
| --- | --- |
| `CI=true pnpm install --frozen-lockfile` | Passed after an offline-cache miss; approved registry access restored all 382 locked packages. Manifests/lockfile unchanged. Existing optional `@parcel/watcher` / `@swc/core` script policy was preserved. |
| `pnpm typecheck` | Passed. [Log](../artifacts/phase15/typecheck.log). |
| `pnpm lint` | Passed, no warnings. [Log](../artifacts/phase15/lint.log). |
| `pnpm build` | Failed at the established sandbox Turbopack/PostCSS worker-port restriction, `Operation not permitted`. [Actual failure](../artifacts/phase15/build-default.log). |
| `pnpm --dir apps/web build --webpack` | Passed. This production output served the final browser checks. [Log](../artifacts/phase15/build-webpack.log). |
| `pnpm --dir apps/web test:e2e --timeout=60000 --trace=off` | **1,044 passed, 40 expected skips, zero failures; 1,084 total, 4.4 minutes.** All preserved cases plus 16 new Phase 15 project cases. [Full log](../artifacts/phase15/playwright-full.log). |
| Expanded-state whole-document accessibility / geometry | **40 checks, zero WCAG A/AA violations and zero overflow findings.** EN/AR at 1440/375/320: public/platform navigation, searchable agency choice, invalid Quick Add, unsaved dialog, assistance drawer, populated canonical preview and agency drawer. [Audit](../artifacts/phase15/interactions/audit.json). |
| Six-width visual matrix | **252 captures, zero document overflow, zero HTTP errors.** EN/AR at 1440/1280/1024/768/375/320. [Audit](../artifacts/phase15/after/audit.json), [manifest of 450 reference/before/representative/after/open-state PNGs](../artifacts/phase15/screenshot-manifest.json). |
| Source / scope review | Independent bounded review has no remaining blocker; `git diff --check` passed. Canonical engines, demo-provider logic, dependencies/lockfile and historical evidence are unchanged. [Review](../openspec/changes/0019-client-reference-ui-revamp/review.md). |

New tests exercise registration through canonical sharing/enquiry preparation, agency-switch recovery, edited seeded-property preview versus static catalogue, compact navigation, local fonts, keyboard/collapse persistence, reduced motion and populated preview geometry at all six widths. Existing full-suite coverage retains property editing/AI review, publishing checks/retries/quotas, enquiries/consent, campaign approval, billing and multi-agency state. The 40 skips comprise 38 preserved duplicate/device cases and two new duplicate width matrices; both locales' matrices execute in the desktop project.

Reproduce with the Webpack build served on port 3215: `PLAYWRIGHT_PRODUCTION=1 PLAYWRIGHT_PORT=3215 MAXPRO_EVIDENCE_ROOT=artifacts/phase15/regression PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=<installed Chromium executable> pnpm --dir apps/web test:e2e --timeout=60000 --trace=off`. This macOS run used `caffeinate -i -s`. Capture helpers are `scripts/client-reference-{research,evidence,product,interactions}.cjs`. The owned QA server was stopped after verification.

Earlier development evidence is excluded from final passing counts. The first complete run recorded 1,034 passes and ten failures: feature-hero contrast, a preview selector affected by the new second product image, and detail crops that selected the channel tab strip. These were repaired without weakening business-rule assertions. Expanded-state inspection also found and repaired intrinsic gallery-thumbnail overflow on phones; the populated preview was added to the width regression. The first final rerun was not executed because automatic approval review hit a usage limit. After the user resumed, the complete final run above passed. No interrupted attempt is presented as passing.

## Remaining acceptance

The brand name/logo, final commercial terms, legal advertiser/permit policy and authorized partner capabilities still require stakeholder decisions. Professional Arabic completion/native-speaker review, physical iOS/Android keyboards, Safari/Firefox and assistive-technology UAT remain outside Chromium evidence. Browser-local data and role controls are editable simulations, not production security. No separate UAT report/screenshots were available beyond the brief. The reference's catalogue URLs returned 404 and standalone report/settings screens were not exposed, so these areas follow the newer application's workflows and shared observed design qualities.

Stakeholder visual checklist:

- Compare the three representative screens with the inspected reference; approve identity, headings, green action hierarchy and density.
- Create a fictional agency and property; inspect optional assistance, media, source review, portal repair and local outcome.
- Open the saved canonical sharing preview; switch agencies and check recovery; prepare an enquiry and WhatsApp message without sending.
- Triage an enquiry, inspect Inbox, campaign approvals, actual-record performance and illustrative billing.
- Review EN/AR at all six widths, expanded navigation/search/dialogs, keyboard focus and reduced motion.

No commit, push or deployment was performed.
