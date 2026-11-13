# Gemini PRD → v3 prototype traceability

**Status definition**
- **Interactive demo** = explicit route and local browser behavior, not a live backend.
- **UI concept** = screens present but main technical workflow still simulated or incomplete.
- **Pending** = no adequate end-to-end screen or backend.
- **Production** = **all rows NOT IMPLEMENTED**; all external providers are unconnected.

| ID | Gemini PRD scope | Main v3 route | Current prototype | Production / UX gap |
|---|---|---|---|---|
| GEM-01 | Landlord/broker/agency/super-admin personas, multi-tenant RBAC | `/register`, `/workspace/organization`, `/workspace/team`, `/workspace/admin/users` | Interactive demo: shared profiles/membership, six fictional personas, central command permissions, directory and audit | Authenticated Frappe onboarding, organization selection/isolation, real permissions and verification |
| GEM-02 | Canonical property CRUD, rent/sale, cheques, deposit, location, compliance | `/workspace/inventory`, `/workspace/inventory/[id]/edit` | Interactive demo: canonical browser-local lifecycle | Production CRUD/revisions, per-field evidence, server validation and API |
| GEM-03 | Arabic/English titles, copy and RTL | `/workspace/inventory/[id]/edit`, `/workspace/studio` | Interactive demo (specific fields) | Most v2 screen bodies need full Arabic extraction and native-speaker RTL UAT |
| GEM-04 | Multi-media room categories, ordering, watermark and floor plans | `/workspace/inventory/[id]/media` | Interactive demo: persistent ordered metadata | S3 upload, image processing, EXIF removal, scanning, CDN; drag/drop alternative to arrow ordering |
| GEM-05 | Per-portal compliance and preflight | `/workspace/publish`, `/workspace/hub/feeds` | Interactive demo: shared canonical + mapping validation, required-field inspection | Official provider contracts and real validation rules; owner verification |
| GEM-06 | Connector marketplace by category | `/workspace/hub/marketplace` | Interactive demo: search/category filters, capability metadata and guarded local setup | OAuth, encrypted credentials, rate limits, provider operations |
| GEM-07 | Property Finder, Qatar Living, Bayut/Dubizzle adapters | `/workspace/hub/connectors/[id]` | Interactive demo: versioned internal example contracts; setup, eligibility and real access separated | Partner onboarding and verified permitted API/feed support |
| GEM-08 | One-click outbound syndication, per-destination status | `/workspace/publish`, `/workspace/hub/jobs` | Interactive demo: revision-bound approval, local queue, retry/cancel and attempt inspector | Durable queue, signed acknowledgements, retries, idempotency, status reconciliation |
| GEM-09 | Tenant feed URLs, XML/JSON/CSV and rotation | `/workspace/hub/feeds` | Interactive demo: actual saved property XML/JSON/CSV previews + local downloads; no endpoint/token | Secure feed endpoint, tokens, schedules, fetch logs, revocation |
| GEM-10 | Meta catalogue, CAPI, Pixel, ad approvals | `/workspace/integrations/meta-catalog`, `/workspace/campaigns/new`, `/workspace/campaigns/[id]` | Interactive local demo: canonical catalogue preview, revision-bound policy/advertiser/optional admin approval, guarded simulation, consent-aware event drafts | Official account/region/catalogue eligibility, provider/legal policy, authenticated server approvals, real Pixel/CAPI |
| GEM-11 | Google Ads / PMax | `/workspace/integrations/google-ads`, `/workspace/campaigns` | Interactive local planning: canonical property, objective, conversion goal, creative, budget and approval flow; Website-first-touch fictional campaign enquiries | Authorized account/country/campaign-type/feed support, validated conversion/asset requirements, Google intake adapter |
| GEM-12 | GA4 / GTM / Measurement Protocol | `/workspace/integrations/ga4` | Interactive consent-aware local event previews (GA4 concept and campaign ID parity) | Real consent enforcement/records, authorized browser/server tags, deduplication, secrets |
| GEM-13 | Multi-channel leads, normalize and deduplicate | `/workspace/leads`, `/workspace/inbox` | Interactive demo: unified canonical CRM, five internal intake contracts, scoped event deduplication, linked inbox and recovery | Signed partner webhooks, official mappings, privacy consent and durable ingestion |
| GEM-14 | Round-robin team assignment | `/workspace/leads/assignment` | Interactive demo: persisted round-robin cursor, availability, manual handover, fallback/backlog and decisions | Atomic tenant-scoped dispatcher, real membership/availability and durable audit |
| GEM-15 | Viewing appointment booking | `/workspace/leads/viewings` | Interactive demo: lead-linked persistent requests, local/example conflict checks, confirmation/completion/cancellation | Live calendar, real availability, invitation and notifications |
| GEM-16 | Official WhatsApp API and opt-in | `/workspace/integrations/whatsapp`, `/workspace/inbox`, `/workspace/whatsapp/packs` | Bounded interactive demo: linked local conversation, reply preference, simulated replies and handover; official API remains UI concept | Official number, templates, signed webhooks, legal opt-in, 24h messaging rules, policy review |
| GEM-17 | Branded landing pages and custom domains | `/properties/[id]`, `/workspace/settings/domains` | Interactive demo: persistent organization branding and reserved-domain setup preview | DNS verification, TLS, routing, identity, branded production landing page and SEO |
| GEM-18 | Listing/connector/AI-seat subscription quotas | `/workspace/billing`, `/workspace/publish` | Interactive demo: effective plan overrides; listing/portal reservations; invited/active seat guards; deterministic campaign-proposal credits; subscription impact preview | Transactional entitlements and enforcement on backend operations |
| GEM-19 | Sample 179/725/1800+ QAR commercial tiers | `/pricing`, `/workspace/billing` | Interactive demo: configurable illustrative pricing, local plan selection and example invoice history | Commercial approval; no annual discount inferred; gateway selection |
| GEM-20 | Connector health, failure queue, rate limits | `/workspace/admin/connector-health`, `/workspace/hub/jobs` | Interactive demo: filterable local jobs, diagnostics, validation snapshots, canonical moderation queue, operational settings and audit history | Telemetry, per-org API limits, retry dashboards and alerts |
| GEM-21 | AI copy, media enhancement, lead scoring | `/workspace/studio`, `/workspace/leads` | Interactive local source/proposal/human review + deterministic bilingual marketing, headline/features/creative/objective/budget/weekly proposals with references and accept/reject history | AI provider, authenticated factual tools/grounding/evaluations, server approval and credit ledger; no model connected |
| GEM-22 | Mobile/PWA for agents | Responsive pages | UI concept | Actual service worker/installability/offline strategy, photos on mobile, device testing |
| GEM-23 | Tenant persistence, queues, real integrations, payments (Frappe decision supersedes PRD backend examples) | `docs/12-architecture-contracts.md` | Design only | Entire backend/integrations; no production readiness claim |
| GEM-24 | Channel attribution, qualified leads, ROI | `/workspace/analytics` | Interactive demo: shared lead-derived source/property/date cohorts, qualification, conversion, backlog, local response samples, campaign-linked cohorts/status and explicit fictional dated spend/CPQL | Real event pipeline, marketing cost reconciliation, attribution/consent governance and verified revenue |

## Explicit milestone gates

**Prototype Gate A (visual):** Every core route has task-specific composition, desktop/mobile/Arabic screenshots, copy completeness, keyboard states and design signoff; no repeated generic KPI-card grids.

**Prototype Gate B (functional):** Person can open inventory, edit sample canonical facts, prepare local provider connection(s), run per-destination checks, simulate publishing into local history, inspect source-attributed leads, test round-robin, preview channel ROI, and review plan limits. No blank links or inert controls in these critical journeys.

**Production Gate C:** Backend APIs, authorization, row-level tenant isolation, official partner credentials, provider-specific validated schemas, audit events, idempotent queue jobs, external acknowledgement/reconciliation, billing, privacy/legal approval, full Arabic localization and end-to-end UAT.

**Known not completed in v3:** Production property persistence (browser-local canonical create/edit/media/review/history is implemented in change 0005), product-wide Arabic translations, service worker/PWA install, drag-and-drop upload processing, live duplicate detection, live bookings, live AI scoring/copy, real accounts, real billing, real portal/Meta/Google/WhatsApp connectivity. Keep them visible in the backlog, not hidden under a screenshot.

Phase 2 implementation and verification: `docs/18-phase2-connector-hub.md`, OpenSpec change `0006-connector-hub-prototype`. All provider contracts remain illustrative; production status is unchanged.

Phase 3 implementation and evidence: `docs/19-phase3-lead-crm.md`, OpenSpec `0007-unified-lead-crm`. CRM, conversations, viewings and source reporting share the existing local repository. All providers remain unconnected; production status is unchanged.

Phase 4 implementation and evidence: `docs/20-phase4-marketing-campaigns.md`, OpenSpec `0008-marketing-campaign-studio`. Campaigns, proposals, revision-bound approvals, local simulation and attributed CRM enquiries share the existing versioned repository. CAPI/Pixel/Google/AI/payment providers remain unconnected; production status is unchanged.

Phase 5 implementation: `docs/21-phase5-organization-admin.md`, OpenSpec `0009-organization-admin`. Primary GEM-01/17/18/19/20. Organization schema v1 extends the existing envelope; local permissions, moderation and entitlements integrate with property/connector/CRM/campaign commands. New organizations are directory profiles; operational examples remain Pearl Gate. These UX guards provide no production authentication, tenant isolation or RBAC. The approved future backend is a custom Frappe application (see `docs/22-frappe-backend-blueprint.md`); no backend is implemented and every production row remains NOT IMPLEMENTED.
