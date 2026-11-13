# Final prototype audit — Phase 6

13 November 2026. Baseline `ad8571455a93dbde3c1829d301a518a3c973b73d`. Scope: OpenSpec `0010-final-prototype-acceptance`, GEM-01–24. This is an agency-first Real Estate Operating System and Connector Hub. No backend, credential, external integration, spend, commit, push or deployment was added.

## Audit basis and baseline

Read the original Gemini PRD, source precedence, requirements matrix, architecture/design/delivery guidance, Phase 0–5 reports and Frappe blueprint. Latest remote baseline [CI run 43367248388](https://github.com/Mayureshju/maxpro/actions/runs/43367248388) completed successfully. That result applies to the baseline; local uncommitted Phase 6 work is verified separately. See `artifacts/phase6/logs/baseline-ci.json`.

## Confirmed issues and repairs

| Finding | Final change | Requirements |
|---|---|---|
| Directory organizations could not operate independently; commands/decoders used Pearl Gate's literal ID | Visible organization selector, independent operational slices, migration/runtime validation and selected-scope command checks. New organizations start empty; original Pearl Gate IDs/revisions remain intact | GEM-01/02/08/13/18/20/24 |
| Switching could retain a transient editor/approval from another context; provider detail highlighted the overview | Remount operational surface on selection; navigate to overview; stale/foreign IDs have safe recovery; cross-tab state follows selected scope; provider detail stays under marketplace navigation | GEM-01/05/08/21 |
| Membership, plan, CRM assignment, connector setup and audit displays used fixed scope (including inactive organization routing pools) | Resolve selected organization in commands, intake contracts, campaign scope, decoder references, quota usage, members, subscription history and audit. Platform plan definitions/operational policy remain explicitly shared admin fixtures | GEM-01/13/14/18/19/20 |
| New private landlords/brokers had no available owner in the initial routing pool | Their one fictional member starts as the direct routing target; agencies still start with an unconfigured team; permissions unchanged | GEM-01/13/14/15 |
| WhatsApp pack used static listing fixtures and SLA used unrelated sample people | Pack now reads selected canonical facts/revision/ordered media; SLA compatibility route opens canonical inbox; no message sent | GEM-04/13/16 |
| Brand preview always linked a Pearl Gate property | Selected-organization portfolio preview reflects brand/domain request and canonical inventory; empty state; DNS/TLS remain unverified | GEM-17 |
| Support keyword action returned the same fixed recommendation for any request | Local keyword lookup uses selected canonical records, explicit empty result, inventory source link and planning label; no model or availability claim | GEM-21 |
| New organizations displayed Pearl Gate invoice examples | Sample invoice records remain with Pearl Gate; other organizations show empty sample history and their own local plan audit | GEM-18/19 |
| Legacy URLs duplicated canonical screens without explaining their purpose | Compatibility notice links to primary workflow; public showcase and planning concepts retained and labelled | GEM-06/10/12/16/20 |
| Arabic routes contained extensive English labels, body copy, errors and statuses | Explicit shared Arabic presentation catalogue plus existing bilingual copy; translated accessibility names, enums, source checks and audit action labels; form values, IDs, payloads and user-authored source content preserved | GEM-03 |
| Broad axe audit found low-contrast secondary text and four nonfocusable scroll tables | Adjusted existing green/brass text tones based on measured contrast; keyboard-focusable legacy tables; shared-shell audit added | GEM-03/22 |
| Organization controls, Arabic headline typography and media interactions needed refinement | Responsive context selector, logical CSS, Arabic headline line-height, selected-brand watermark, native media drag reorder plus keyboard arrows; removed inert-looking sidebar chevron | GEM-04/17/22 |
| Frontend transport context/revision requirements were not explicit | Scoped repository envelopes reject foreign selected context and inconsistent expected revision; separate proposed API/query/error/loading/approval/acknowledgment DTO contracts | GEM-23 |

The original editorial stone/eucalyptus direction is preserved. Inventory uses operational tables/gallery; editor uses sectioned fields and preflight; marketplace uses provider rows; publishing uses per-destination checks and ledger; CRM uses table/pipeline/dossier/inbox; campaigns use staged policy/creative/approval; billing uses entitlements and usage; admin uses scoped records/review/audit. No replacement template or illustration was used as render evidence.

## Organization model and invariants

The same `maxpro-gemini-v3-demo-state` envelope adds `workspaceSchemaVersion:1`, selected organization and validated operational slices (properties, jobs, prepared connectors, campaigns, CRM and assignment settings). Shared directory, memberships, platform plan overrides, moderation and bounded audit remain in the envelope. Each command resolves selected scope; restore checks record-to-organization and linked-record references. Current top-level fields project the active slice for existing consumers; archived slices preserve previous operations.

Each fictional organization can edit properties, use Studio/media, prepare permitted connectors, queue independent jobs, ingest linked leads, assign members and create campaigns. All existing source/human-review, revision-bound moderation/campaign approval, quota and role guards remain. Switching is a UX simulation in editable browser storage, **not authentication or secure tenant isolation**. No real accounts/personal data/secrets belong here. Browser persistence is bounded to 4 MB; storage-full uses memory with a visible warning.

## Screen-by-screen audit

Every route template below is included in route smoke and active-screen accessibility checks in both locales/device projects. Main dynamic journey suites exercise valid browser-created property, lead and campaign IDs, while unknown IDs deliberately exercise recovery. A default campaign smoke ID can render recovery because campaigns start empty; populated approvals/creative/analytics are exercised in `campaigns.spec.ts`.

| Route (locale prefix omitted) | Screen / dominant task | Status and data source |
|---|---|---|
| `/about` | Read illustrative product/legal information or preview a local form | Secondary public showcase / local form; no account, enquiry or booking delivery |
| `/agencies/[id]` | Read illustrative product/legal information or preview a local form | Secondary public showcase / local form; no account, enquiry or booking delivery |
| `/agencies` | Read illustrative product/legal information or preview a local form | Secondary public showcase / local form; no account, enquiry or booking delivery |
| `/compare` | Preview local showcase research/compare/map tools | Secondary public showcase / local form; no account, enquiry or booking delivery |
| `/contact` | Read illustrative product/legal information or preview a local form | Secondary public showcase / local form; no account, enquiry or booking delivery |
| `/faq` | Read illustrative product/legal information or preview a local form | Secondary public showcase / local form; no account, enquiry or booking delivery |
| `/favorites` | Preview local showcase research/compare/map tools | Secondary public showcase / local form; no account, enquiry or booking delivery |
| `/map` | Preview local showcase research/compare/map tools | Secondary public showcase / local form; no account, enquiry or booking delivery |
| `/` | Explore the agency operating system and secondary showcase | Secondary public showcase / local form; no account, enquiry or booking delivery |
| `/pricing` | Compare illustrative Gemini subscription tiers | Secondary public showcase / local form; no account, enquiry or booking delivery |
| `/privacy` | Read illustrative product/legal information or preview a local form | Secondary public showcase / local form; no account, enquiry or booking delivery |
| `/properties/[id]` | Review a secondary example property and local enquiry form | Secondary public showcase / local form; no account, enquiry or booking delivery |
| `/properties` | Filter secondary example property listings | Secondary public showcase / local form; no account, enquiry or booking delivery |
| `/register` | Create and select a fictional organization | Selected-organization local workflow; canonical records and guarded actions |
| `/resources` | Read illustrative product/legal information or preview a local form | Secondary public showcase / local form; no account, enquiry or booking delivery |
| `/saved-searches` | Preview local showcase research/compare/map tools | Secondary public showcase / local form; no account, enquiry or booking delivery |
| `/sign-in` | Read illustrative product/legal information or preview a local form | Secondary public showcase / local form; no account, enquiry or booking delivery |
| `/solutions` | Read illustrative product/legal information or preview a local form | Secondary public showcase / local form; no account, enquiry or booking delivery |
| `/terms` | Read illustrative product/legal information or preview a local form | Secondary public showcase / local form; no account, enquiry or booking delivery |
| `/workspace/admin/audit` | Filter the selected organization’s local audit | Selected-organization local workflow; canonical records and guarded actions |
| `/workspace/admin/cms` | Configure local dispatch pause and review policy | Labelled compatibility route → `/workspace/admin/taxonomies` |
| `/workspace/admin/connector-health` | Inspect local connector readiness and failures | Selected-organization local workflow; canonical records and guarded actions |
| `/workspace/admin/integrations` | Inspect local connector readiness and failures | Labelled compatibility route → `/workspace/admin/connector-health` |
| `/workspace/admin/moderation` | Review the current property revision | Selected-organization local workflow; canonical records and guarded actions |
| `/workspace/admin/organizations` | Inspect fictional organization status, plans and members | Labelled compatibility route → `/workspace/admin` |
| `/workspace/admin` | Inspect fictional organization status, plans and members | Selected-organization local workflow; canonical records and guarded actions |
| `/workspace/admin/plans` | Configure illustrative entitlement definitions | Selected-organization local workflow; canonical records and guarded actions |
| `/workspace/admin/reports` | Filter the selected organization’s local audit | Labelled compatibility route → `/workspace/admin/audit` |
| `/workspace/admin/taxonomies` | Configure local dispatch pause and review policy | Selected-organization local workflow; canonical records and guarded actions |
| `/workspace/admin/users` | Manage fictional membership, roles, seats and availability | Selected-organization local workflow; canonical records and guarded actions |
| `/workspace/ads/attribution` | Inspect campaign-linked lead and fictional cost cohorts | Labelled compatibility route → `/workspace/analytics` |
| `/workspace/ads/catalogue` | Plan a canonical Meta/Google campaign and catalogue | Labelled compatibility route → `/workspace/integrations/meta-catalog` |
| `/workspace/ads/placements` | Review labelled placement-planning examples | Explicit planning concept / local preview; no external service |
| `/workspace/analytics` | Compare source/property/date lead cohorts | Selected-organization local workflow; canonical records and guarded actions |
| `/workspace/billing/dunning` | Inspect scoped illustrative invoice/history examples | Explicit planning concept / local preview; no external service |
| `/workspace/billing/invoices/[id]` | Inspect scoped illustrative invoice/history examples | Selected-organization local workflow; canonical records and guarded actions |
| `/workspace/billing/invoices` | Inspect scoped illustrative invoice/history examples | Selected-organization local workflow; canonical records and guarded actions |
| `/workspace/billing` | Review scoped usage, quotas and illustrative plan selection | Selected-organization local workflow; canonical records and guarded actions |
| `/workspace/campaigns/[id]` | Draft, review and simulate a canonical campaign | Selected-organization local workflow; canonical records and guarded actions |
| `/workspace/campaigns/new` | Draft, review and simulate a canonical campaign | Selected-organization local workflow; canonical records and guarded actions |
| `/workspace/campaigns` | Find and resume local campaign drafts | Selected-organization local workflow; canonical records and guarded actions |
| `/workspace/hub/connectors/[id]` | Inspect prerequisites and prepare local setup | Selected-organization local workflow; canonical records and guarded actions |
| `/workspace/hub/connectors` | Find a provider and inspect prerequisites | Labelled compatibility route → `/workspace/hub/marketplace` |
| `/workspace/hub/feeds` | Inspect canonical mappings and export examples | Selected-organization local workflow; canonical records and guarded actions |
| `/workspace/hub/jobs` | Inspect, revalidate, retry or cancel local jobs | Selected-organization local workflow; canonical records and guarded actions |
| `/workspace/hub/mappings` | Inspect the shared canonical mapping/export workbench | Labelled compatibility route → `/workspace/hub/feeds` |
| `/workspace/hub/marketplace` | Find a provider and inspect prerequisites | Selected-organization local workflow; canonical records and guarded actions |
| `/workspace/hub` | Review per-destination readiness | Selected-organization local workflow; canonical records and guarded actions |
| `/workspace/inbox` | Review linked conversations and local reply consent | Selected-organization local workflow; canonical records and guarded actions |
| `/workspace/integrations/ga4` | Prepare consent-aware integration/event plans | Selected-organization local workflow; canonical records and guarded actions |
| `/workspace/integrations/google-ads` | Plan a canonical Meta/Google campaign and catalogue | Selected-organization local workflow; canonical records and guarded actions |
| `/workspace/integrations/meta-catalog` | Plan a canonical Meta/Google campaign and catalogue | Selected-organization local workflow; canonical records and guarded actions |
| `/workspace/integrations/whatsapp` | Prepare consent-aware integration/event plans | Selected-organization local workflow; canonical records and guarded actions |
| `/workspace/inventory/[id]/edit` | Edit canonical facts and bilingual copy | Selected-organization local workflow; canonical records and guarded actions |
| `/workspace/inventory/[id]/enquiries` | Review the canonical property dossier and history | Selected-organization local workflow; canonical records and guarded actions |
| `/workspace/inventory/[id]/media` | Classify and reorder canonical media metadata | Selected-organization local workflow; canonical records and guarded actions |
| `/workspace/inventory/[id]` | Review the canonical property dossier and history | Selected-organization local workflow; canonical records and guarded actions |
| `/workspace/inventory/[id]/publishing` | Inspect one property’s destination ledger | Selected-organization local workflow; canonical records and guarded actions |
| `/workspace/inventory/import` | Preview a labelled file-selection concept | Explicit file-selection concept; no parser/upload claimed |
| `/workspace/inventory/new` | Create an empty canonical draft | Selected-organization local workflow; canonical records and guarded actions |
| `/workspace/inventory` | Search and filter selected canonical inventory | Selected-organization local workflow; canonical records and guarded actions |
| `/workspace/leads/[id]` | Qualify, assign and follow up one canonical lead | Selected-organization local workflow; canonical records and guarded actions |
| `/workspace/leads/assignment` | Configure membership-based routing and inspect decisions | Selected-organization local workflow; canonical records and guarded actions |
| `/workspace/leads` | Ingest examples and manage the canonical pipeline | Selected-organization local workflow; canonical records and guarded actions |
| `/workspace/leads/viewings` | Request and manage linked local viewing slots | Selected-organization local workflow; canonical records and guarded actions |
| `/workspace/notifications` | Review labelled sample notifications | Selected-organization local workflow; canonical records and guarded actions |
| `/workspace/organization/new` | Manage selected profile, preferences, verification or brand | Selected-organization local workflow; canonical records and guarded actions |
| `/workspace/organization` | Manage selected profile, preferences, verification or brand | Selected-organization local workflow; canonical records and guarded actions |
| `/workspace` | Resolve property, distribution and lead priorities | Selected-organization local workflow; canonical records and guarded actions |
| `/workspace/publish` | Validate and approve per-destination local queueing | Selected-organization local workflow; canonical records and guarded actions |
| `/workspace/settings/domains` | Manage selected profile, preferences, verification or brand | Selected-organization local workflow; canonical records and guarded actions |
| `/workspace/settings/domains/preview` | Preview the selected branded canonical portfolio | Selected-organization local workflow; canonical records and guarded actions |
| `/workspace/settings` | Manage selected profile, preferences, verification or brand | Selected-organization local workflow; canonical records and guarded actions |
| `/workspace/settings/privacy` | Preview labelled data-rights request concepts | Explicit planning concept / local preview; no external service |
| `/workspace/studio` | Review supplied facts, media and proposed bilingual copy | Selected-organization local workflow; canonical records and guarded actions |
| `/workspace/support/assistant` | Inspect local keyword search and AI planning boundaries | Explicit planning concept / local preview; no external service |
| `/workspace/support/evaluations` | Inspect local keyword search and AI planning boundaries | Explicit planning concept / local preview; no external service |
| `/workspace/support/knowledge` | Inspect local keyword search and AI planning boundaries | Explicit planning concept / local preview; no external service |
| `/workspace/team` | Manage fictional membership, roles, seats and availability | Selected-organization local workflow; canonical records and guarded actions |
| `/workspace/verification` | Manage selected profile, preferences, verification or brand | Selected-organization local workflow; canonical records and guarded actions |
| `/workspace/whatsapp/packs` | Preview a canonical property pack by stage/language | Selected-organization local workflow; canonical records and guarded actions |
| `/workspace/whatsapp/sla` | Review linked conversations and local reply consent | Labelled compatibility route → `/workspace/inbox` |
| `/workspace/whatsapp/templates` | Review labelled template-planning concepts | Explicit planning concept / local preview; no external service |

## Verification, visual review and freeze status

Exact commands/results, screenshot inventory and axe reports are recorded in [verification.json](../artifacts/phase6/verification.json) and [OpenSpec acceptance results](../openspec/changes/0010-final-prototype-acceptance/acceptance-results.md). Evidence remains under `artifacts/phase6/`; historical tracked artifacts were restored after the initial regression run and later runs write into the Phase 6 regression directory.

Dependency installation, `pnpm typecheck` and `pnpm lint` passed. Default `pnpm build` hit a sandbox EPERM during Turbopack worker port binding; the separately tested webpack production build passed. The full Chromium suite passed **779**, intentionally skipped **31**, and failed **0**. Afterward, three presentation-only files changed to translate a source label and preserve original enquiry/note wording. Final typecheck/lint/webpack build and the affected acceptance/copy/Arabic CRM checks passed (**37 passed, 1 intentional mobile drag skip, 0 failed**); the full suite was not rerun after that delta. Both frontend source fingerprints and the exact delta are retained.

All-route axe reports contain **336 audited states with zero violations**; the final Studio/inbox followup adds **8 states with zero violations**. The manifest contains **610 actual screenshots**, including regression captures, refreshed view copies and followup evidence. All twelve derived contact sheets and selected expanded screenshots were inspected; see [visual review](../artifacts/phase6/visual-review.md).

Automated checks are not independent visual, accessibility, Arabic or legal certification. Chromium desktop/mobile emulation is exercised at 1440, 1024, 768 and 375 pixels; physical devices, Safari and Firefox remain separate UAT. Native-speaker review must check terminology, grammar, source fields, error tone, truncation and natural RTL navigation. Provider names, stable identifiers, wire formats, fictional aliases and original English source/messages intentionally retain their original form. No claim of professionally approved full Arabic coverage is made.

Installed Claude Code was invoked read-only and returned `Not logged in`. Independent second-tool review required by AGENTS remains unavailable; see `logs/independent-review.log`. Codex implementation self-review and test evidence do not substitute for that review. The repository is a prototype acceptance candidate; final human freeze approval remains conditional on the unresolved review decisions below.

## Explicit unresolved decisions and production exclusions

Independent architecture/design review and Arabic native-speaker UAT; final MaxPro/AqarPro legal identity; licensed Qatar/GCC property imagery; whether the secondary public marketplace launches; geography/licensing rules; official portal rights/schemas; Meta/Google/WhatsApp account/policy approval; payment gateway/tax/invoice rules; data residency/retention; approved Frappe/database/deployment versions and security model. See `25-frappe-integration-readiness.md` for the implementation handoff.

Actual secure uploads/transformation, AI inference/scoring, service worker/offline installability, provider dispatch/acknowledgment, webhooks, calendars, messaging, analytics collection, payments, DNS/TLS binding and authenticated Frappe persistence remain unimplemented. Their local previews are labelled as such and are not production acceptance claims.
