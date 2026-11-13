# Prototype acceptance matrix — Phase 6

13 November 2026. “Implemented” below means **fictional browser-local interaction**, not production. Every external integration and backend requirement remains unimplemented. Exact final command counts and evidence are in `artifacts/phase6/verification.json` and OpenSpec 0010 acceptance results. Independent review and native-speaker signoff remain separate gates.

## Required journey families

| Journey | Demonstrable path / canonical authority | Positive and negative acceptance | Browser evidence |
|---|---|---|---|
| 1. Landlord / broker / agency onboarding | Register → organization create → select organization → role/profile/team | Empty independent operations; correct type/owner/plan; private landlord/broker direct enquiry assignment; role permissions; suspended and foreign commands denied | `organization-admin.spec.ts`, `final-acceptance.spec.ts`; onboarding/organization/new-organization-empty |
| 2. Property / media / Studio | Create UUID draft → editor → ordered media → source/copy review → handoff | Incomplete save/reload; source vs proposed vs approved copy; metadata-only files; keyboard reorder/native drag; stale revision and unknown-ID recovery | `lifecycle.spec.ts`; create/editor/media/studio/property |
| 3. Compliance and approval | Canonical facts → source review → moderation current revision → preflight | Missing permit/media/source checks; changes requested/rejected; edits invalidate dependent reviews; no legal-verification claim | `organization-admin.spec.ts`, `connector-hub.spec.ts`; compliance/editor |
| 4. Connector discovery/configuration | Marketplace search/category → named provider → acknowledge local setup | Prepared vs authorized separated; plan portal limits; Bayut country confirmation; no credential form or invented remote access | `connector-hub.spec.ts`; marketplace/connector |
| 5. Validation / queue / history | Property → destinations → preflight → approve → local dispatch → inspector/retry/cancel | Revision/config/plan approval context; per-destination blocked/queued; attempt snapshots; cancellation releases reservations; never remote accepted | `lifecycle.spec.ts`, `connector-hub.spec.ts`; publishing/jobs and populated regression inspectors |
| 6. Lead intake / CRM / inbox | Selected canonical property → internal example → intake receipt → table/pipeline → linked conversation | Organization/source/event dedupe; unknown property/foreign ID/personal data rejected; first touch retained; opt-out blocks local reply | `lead-crm.spec.ts`; crm/lead/inbox |
| 7. Viewing / assignment | Available members → round-robin/manual/fallback → linked viewing request | Cursor survives reload; suspended members skipped; conflict/date guards; cancel/rebook; no calendar invitation sent | `lead-crm.spec.ts`, `organization-admin.spec.ts`; routing/viewings |
| 8. Campaign / AI suggestions / approval | Property → campaign draft → bilingual proposals/creative → policy/advertiser/optional admin → simulate | Canonical facts/media grounding; revision receipts; unsupported targeting/budget/source blocks; accept/reject proposal audit; no model/spend | `campaigns.spec.ts`; campaign-create and populated Phase 4 regression captures |
| 9. Meta / Google / GA4 / attribution | Canonical catalogue and platform plan → consent-aware event preview → linked enquiry → campaign/source cohorts | Shared event identity; Google uses Website first touch explicitly; cost/CPQL from fictional dated ledger; no reach/revenue/ROAS claims | `campaigns.spec.ts`, `lead-crm.spec.ts`; meta/google/ga4/analytics |
| 10. WhatsApp demonstrations | Selected canonical property pack → language/stage/media preview; CRM inbox/handover | Pack reflects exact selected organization/revision; empty state; reply consent guard; no remote send/approved-template claim | `final-acceptance.spec.ts`, `lead-crm.spec.ts`; whatsapp/inbox |
| 11. Subscription / quota / invoice / team | Effective illustrative plan → usage/impact → local selection → membership controls/history | 3/25/negotiated listings, 1/2/all-authorized portals; invited seats reserved; last-owner and credit guards; other organizations do not inherit Pearl Gate sample invoices | `organization-admin.spec.ts`, `connector-hub.spec.ts`; billing/invoices/team |
| 12. Super administrator | Organization directory → members/status/plan → moderation → diagnostics/policy/audit | Central role guards; selected-scope audit; review notes/revision; maintenance blocks simulate/retry while cancel remains possible; no production RBAC claim | `organization-admin.spec.ts`; admin/plans/audit/compliance |
| 13. Agency branding / domains | Brand/domain `.example` draft → local checklist → selected-organization portfolio preview | Name/domain and property links use selected records; empty portfolio; domain change clears preview; DNS/TLS remain unverified | `final-acceptance.spec.ts`, `organization-admin.spec.ts`; branding/brand-preview |

## Gemini requirement-by-requirement acceptance

| GEM | Final local implementation / scope | Primary evidence / production exclusion |
|---|---|---|
| 01 | Independent organization slices and switcher; six simulated personas; onboarding/team/directory | Final acceptance + organization suite. No authentication or secure isolation |
| 02 | Canonical property CRUD/edit/archive/source/revisions per selected organization | Lifecycle suite. No durable backend CRUD |
| 03 | Explicit Arabic catalogue, translated UI/status/error/audit labels, RTL and original-language source inputs | Arabic-only acceptance assertions; runtime copy inventory; all-route EN/AR captures. Native-speaker completion/signoff still required |
| 04 | Canonical classified/reordered media, native drag and keyboard arrows, metadata-only selection, selected agency watermark | Lifecycle/media checks and canonical WhatsApp pack. No upload/processing/real floor-plan delivery |
| 05 | Current canonical/source/media/mapping/moderation preflight | Connector/lifecycle/moderation tests. Official portal/legal rules unverified |
| 06 | Searchable/filterable provider directory, requirements and local setup/removal | Connector smoke. No real OAuth or account connection |
| 07 | Named portal concepts with explicit internal versioned mappings/eligibility | Serializer/command/eligibility tests. No official adapter or scraping |
| 08 | Revision-bound local approval, separate destination jobs/retry/cancel/history | Lifecycle/connector tests. No durable queue/remote acceptance |
| 09 | Saved-record XML/JSON/CSV preview/download; safe escaping/formula treatment | Export tests. No provisioned feed URL/token/scheduler |
| 10 | Canonical Meta catalogue, housing/policy/advertiser/admin local approval and event drafts | Campaign full journey. No Meta account/catalogue/CAPI/Pixel delivery |
| 11 | Google/PMax planning with eligibility limits, canonical campaign and attributed Website enquiry | Campaign tests. No universal feed capability assumption or Google dispatch |
| 12 | Consent-aware measurement planning and event identity parity | Measurement/campaign tests. No GA4/GTM collection or server secrets |
| 13 | Unified selected-organization CRM/intake receipts/dedupe/conversations | CRM tests. No signed partner webhook intake |
| 14 | Membership-based round-robin/manual/fallback availability and history | CRM/organization tests. No atomic production dispatcher |
| 15 | Persistent lead-linked viewing request/status/conflict checks | Viewing tests. No calendar service or actual booking |
| 16 | Canonical pack/inbox/reply preference/handover demonstrations and template concepts | Pack/CRM tests. No WhatsApp send, real recipient or template approval |
| 17 | Persistent branding/reserved-domain checklist and scoped portfolio preview | Branding tests. No public domain binding/DNS/TLS |
| 18 | Selected organization listing/portal/seat/proposal-credit guards and usage | Quota/permission tests. No transactional production entitlement ledger |
| 19 | QAR 179 / 725 / 1,800+ and versioned local plan examples, illustrative pending approval | Commercial/billing tests. No purchase, tax/settled invoice or gateway |
| 20 | Directory/status/plan/member administration, local diagnostics/pause, moderation and scoped audit | Organization/connector tests. No provider telemetry or immutable audit |
| 21 | Source/proposal/review Studio, deterministic bilingual marketing suggestions and bounded keyword-support concept | Studio/campaign tests. No model, semantic extraction, media enhancement or production scoring |
| 22 | Responsive operations and keyboard/focusable tables at four required widths | Browser layout/screenshots/axe. Service worker/offline installability and physical-device/cross-browser UAT remain separate |
| 23 | Typed local repository plus proposed Frappe DTO/query/error/approval/job/permission contracts | `25-frappe-integration-readiness.md`, scoped-envelope tests. Entire backend unimplemented |
| 24 | Canonical local lead/source/property/date/campaign cohorts, qualification/conversion/backlog, dated fictional cost/CPQL | CRM/campaign analytics tests. No verified revenue/spend/financial ROI |

## Gate interpretation

Route smoke covers every active page template. Main-content axe scans cover each template in EN/AR desktop/mobile, and a whole-document control-tower scan covers shared navigation/footer. This is automated WCAG A/AA evidence, not comprehensive conformance certification. Major workflows have actual running-app captures in both locales/device sizes; 1024/768 tests cover all 36 core views. Readiness, approved-local, queued-local and remotely accepted remain distinct.

All current implementation and regression results must be read with `23-final-prototype-audit.md` and OpenSpec results. A clean test run does not supply independent design/architecture review, native-speaker approval, provider authorization or production acceptance. Those unresolved decisions remain explicit.
