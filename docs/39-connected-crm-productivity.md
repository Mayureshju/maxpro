# Connected CRM and public product milestone

Date: 18 November 2026 (client time). Baseline `6db0bfbd73660025768a01a6380bb4753ac60ee8` was clean and verified equal to remote `main` with `git ls-remote`. No commit, push or deployment. OpenSpec: [0022](../openspec/changes/0022-connected-crm-productivity/proposal.md). Requirements: GEM-01/02/03/13/14/15/16/17/19/21/22/24; existing GEM-05/06/08/10/11/18 approval/quota behavior remains covered by regression tests.

## Current-state audit and feature classification

Classes: **1** already satisfactory; **2** implemented and improved; **3** missing and implemented here; **4** requires backend/provider access; **5** outside approved scope or pending stakeholder approval. These are prototype classifications, not production readiness claims.

| Requested feature | Verified baseline | Class and disposition |
|---|---|---|
| Public homepage | Restrained branded hero, actual editor screenshot, product tabs, AI explanation, audience, channels, pricing, FAQ and demo CTAs | 2: clearer agency-wide positioning; six linked lifecycle steps through outcomes/performance; explicit marketing-team audience. Preserve visual foundation. |
| Product evidence and interactive demonstration | Actual EN/AR screenshots with enlargement/detail switch and five-stage product tabs; full How It Works tour | 1: retained. New milestone evidence also captures actual rendered CRM states. |
| Features and AI explanation pages | Working chapters, local proposal example, review-before-accept and AI launch/Copilot explanation | 2: document bounded CRM assistance, requirements/matching and follow-ups; chapter navigation follows actual content. |
| How It Works, integrations and agency solution | Cohesive public content, existing tour, destination prerequisites and fictional agency | 1: retained and browser-reviewed. |
| Pricing and quotas | QAR 179 / 725 / 1,800+, 3 / 25 / negotiated listings, 1 / 2 / all-authorized portals; illustrative pending approval | 1: preserved. Final prices/quotas/brand remain class 5. |
| FAQ, contact, sign-in and registration | Accessible FAQ; local contact preview; explicit fictional demo entry/onboarding | 1: retained and tested; no live contact submission or authentication claimed. |
| Public property search/detail | Secondary showcase with filters, gallery, attribution and local enquiry/share preparation | 1: retained. It remains separate from private operations and does not receive a CRM enquiry. |
| Six-section agency workspace and first-property journey | Existing dashboard, guided quick add/editor, AI launch, campaign planning and direct actions | 1: retained; 2: due follow-ups added to Today’s work and briefing prompt contextualized. No dashboard redesign. |
| CRM table, stage board, search and detailed filters | Shared canonical leads; assignment/source/property/stage/priority/qualification controls; inbox/viewing/performance links | 2: My leads, due follow-ups and won/lost views; real upcoming-viewing predicate; next-action column; labelled phone records and horizontally scrollable quick filters; keyboard stage controls use existing command. |
| Lead detail | Source/attribution, property, assignment/stage/qualification, consent, notes, timeline and viewing requests | 2: reviewed requirements and local task lifecycle in the same dossier; contextual summary entry. Existing controls/IDs remain. |
| Structured qualification | Only qualification status/free-text note existed | 3: optional confirmed requirements with purpose/location/budget+period/type/bedrooms/move-in/viewing interest/contact preference. Explicit confirmation; consent is independent. |
| Follow-up lifecycle | Free text and reply preparation, no dated task entity | 3: optional lead-owned task array with date/time, reason, responsible member, open/completed/cancelled states, reschedule and required outcome; stale guards and activity history. No scheduler or notification. |
| Viewing management | Requested → Confirmed → Completed/Cancelled; local agent/property conflicts and Qatar time | 1: retained; 2: Copilot preparation links to status/outcome workflow and follow-up. No Google Calendar claim. |
| Attribution and performance | Canonical source/event/campaign references and source/property/date cohorts | 1: retained; 2: Copilot stage/source counts link to the same filtered property cohort. No invented provider event, spend, causation or revenue. |
| AI A: lead summary | Copilot had enquiry navigation, no complete record-backed summary | 3: current customer/property/source/stage/owner, latest inbound message and message references, last interaction, confirmed requirements, open questions and next action. |
| AI B: suggested reply | Existing reviewed/editable proposal filled Inbox draft but used generic title-only wording | 2: deterministic reply uses latest recorded question, verified asking price when asked and conditional viewing inquiry without booking promises. Existing draft/send separation and consent block remain. |
| AI C: follow-up recommendations | Unanswered/unassigned navigation existed | 2: agency briefing adds actual dated due tasks and reasons. Suggestions never create tasks. |
| AI D: qualification assistance | No extraction into confirmed CRM requirements | 3: conservative explicit-label EN/AR extraction, field/message evidence, atomic conflicting-budget rejection, form review/correction, separate confirmation before canonical save. No free-prose model extraction claimed. |
| AI E: property matching | No implementation found | 3: confirmed constraints vs saved organization properties, exact city/district/type/purpose/bedrooms, comparable monthly/yearly budgets, exclusions and explicit missing/no-match states. Availability remains unverified. |
| AI F: viewing preparation | Existing viewing records, no contextual preparation answer | 3: linked facts, recorded status, customer requirements/open questions, access checklist and next actions. |
| AI G: daily briefing | Attention answer listed only incomplete properties | 3: scoped unassigned/unanswered enquiries, due tasks, open viewings, incomplete properties, recorded publishing blockers and campaign review work. |
| AI H: performance explanation | Qualified/total count explanation existed | 2: stage/source distribution and record links, explicit inability to establish causes or financial outcomes. |
| Existing floating/public assistants | Persistent workspace session, contextual property/lead/campaign, separate public assistant with no private-state input | 1: preserve session/org/persona boundaries; 2: add CRM intents and source-change warnings, preserve portal/channel intents. Shared proposal modal gains explicit keyboard wrap. |
| Real AI/Frappe services | No Frappe app, Python backend, database, model credentials or API implementation found | 4: typed local contracts only; no second backend framework. |
| Portal/Meta/Google/WhatsApp/GBP/GA4, payments, secure uploads, reminders | No authorized live provider connection | 4: remain unconnected; production prerequisites below. |
| Rebranding, approved prices, predictive scoring, broad prose/document extraction, fully approved Arabic, public marketplace as primary product | Not approved production scope | 5: unchanged/deferred. |

Baseline audit used the actual running app: **108** screenshots across EN/AR desktop/phone, zero page errors, HTTP failures or document overflow. A separate original-commit checkout served the unchanged baseline for the **same 25-property fixture** measurements and **24** additional CRM/public captures. This avoids inferring “before” behavior from the new implementation. [Evidence index](../artifacts/phase18/README.md).

## Implementation and compatibility

`CanonicalLead` remains the sole authority. Optional `requirements` and `followUps` preserve schema-v1 compatibility and original Pearl Gate IDs. Strict hydration reconstructs new known fields, excludes malformed extensions with recovery indicated and retains valid base leads. Existing organization slices persist the extensions automatically; no parallel CRM or assistant store was introduced.

New commands require current lead snapshot, organization-linked property, valid values and existing central `lead.work` permissions. Task responsibility validates an available organization member. Changes append activity and central audit. Requirements need explicit confirmation; changing the source resets clean-form confirmation, while dirty forms preserve edits and block stale saves. Task action buttons cannot replace an active task/outcome draft. Existing Inbox unsaved-draft and consent/STOP controls remain authoritative. Same-path lead filter and Inbox query navigation now follows the requested record rather than stale initial state.

Matching never copies property facts into customer preferences. Parser candidates come only from explicit inbound labels such as `Purpose: rent; Location: Doha; Budget: 9000 QAR / month; Type: Apartment; Bedrooms: 2` (Arabic labels also supported). Conflicts omit the affected candidate; any amount/period conflict omits both budget components. Acceptance fills the review form only. Manual correction and explicit confirmation save requirements. Matching uses confirmed fields only, normalizes monthly/yearly rent, keeps sale totals separate, excludes archived/foreign records and states when constraints or availability are unverified.

Copilot remains read-only. It receives existing authorized local context, cites message IDs and property revisions, links to review/correction and never sends, approves, spends or publishes. Saved matching answers detect changes to their property sources; summary answers detect lead changes. Public assistance has no new dependency on private records. “My leads” uses the first active fictional member matching the selected demo role and identifies that simulated member; it is not authenticated identity.

Campaign preparation now links directly to its source property and property-filtered enquiries. The original property/campaign/enquiry identifiers and existing approval logic are preserved. Dashboard changes are limited to recorded due tasks and a daily-briefing entry.

## Reproducible journey measurements

| Fixed fixture path | Baseline activations | Final activations | Text entries |
|---|---:|---:|---:|
| Inventory → new listing → saved property/editor | 2 | 2 | 3 |
| Property → saved campaign draft | 2 | 2 | 0 |
| Enquiry list → intended dossier → Inbox → reviewed reply draft | 4 | 4 | 0 |
| Lead manager → unassigned records | 1 | 1 | 0 |
| Locate AQ-50002 among 25 properties → open record | 1 | 1 | 1 search |
| Property → campaign preparation → linked enquiries | 3 (includes browser Back) | 2 | 0 |

These are scripted semantic-control activations on a controlled fixture, not validated human usability research. Initial route load, reading and scrolling are excluded; text entries are separate. The final path opens the filtered lead manager; the original opens the same property's enquiry table via Back/property navigation. Campaign preparation and saving a draft are distinct from campaign approval or remote execution. Route-completion assertions verify the intended lead before reply preparation. JSON evidence records fixture hash, exact start/end paths, viewport geometry and captures.

On the same fixture at 375px, the first lead row moves from 1,155px to 1,031px in English and 1,060px to 980px in Arabic, primarily by keeping quick views in a scrollable row. At 1440px, English moves from 594px to 638px because the extra operational views wrap; Arabic remains 596px. All detailed filters remain present. These geometry observations describe layout density, not measured user speed.

## Complete scenario coverage

| User scenario | Evidence/behavior |
|---|---|
| 1 First landlord | Existing first-use/agency-first tests: demo registration → quick add → editor/AI review → channel queue → fictional enquiry. |
| 2 Independent broker, 25 listings | Existing product-experience/daily-productivity tests and same-fixture measurements: search, price edits, review invalidation and campaign preparation. |
| 3 Agency manager | Existing assignment/dashboard tests plus due tasks and daily briefing from canonical records. |
| 4 Marketing specialist | Existing campaign tests: property, creative, media, budget, ordered approvals, stale source and spending protections; new source/enquiry links. |
| 5 Website enquiry | Existing public/showcase tests retain a local enquiry preview; no delivery or CRM intake is claimed. |
| 6 Lead qualification | New connected-crm tests: field/message evidence → review form → explicit confirmation → persisted requirements. |
| 7 Property matching | New tests: purpose, budget/period, location/type/bedrooms, saved/foreign/archived properties, no-match and unconfirmed states. |
| 8 Follow-up | New tests: dated local task → due filter → linked conversation → reschedule → required completion outcome → refresh. |
| 9 Viewing | Existing lead-crm tests retain request/confirmation/completion/conflicts; Copilot preparation and local next task connect the flow. |
| 10 Performance | Existing analytics source/cohort tests plus new property-scoped stage links and record-backed explanation. |
| 11 Arabic mobile | Both browser projects run EN/AR; new forms/proposals/matching/summary additionally inspected at all six requested widths. Native-speaker review remains pending. |
| 12 Restricted user | Existing organization/role/provider tests plus foreign matching/task/member rejection; browser-local role simulation is not production security. |
| 13 Interruption | Refresh round-trip, cross-tab stale proposals/tasks, dirty form preservation, explicit discard, organization switch and no accidental canonical overwrite. |
| 14 Unavailable integration | Existing channel prerequisite/blocked-job/campaign tests retain official-access and approval boundaries. |

## Verification and review

Final results and screenshot manifest are recorded in [phase18 evidence](../artifacts/phase18/README.md). Required locked install succeeded after network-enabled execution. The default build encountered the documented Turbopack worker-port sandbox failure; the webpack alternative is the accepted production build. Final acceptance uses a restarted frozen webpack output; source changes/rebuilds are not performed during that run. Initial failures are retained and explained rather than removed or counted as passes.

Final results: `pnpm typecheck` and `pnpm lint` passed; `pnpm --dir apps/web build --webpack` passed. `pnpm --dir apps/web test:e2e --timeout=60000 --trace=off` completed **1,143 passed / 45 expected skips / zero failures**, 1,188 total in 4.7 minutes. The 45 skips comprise the existing 44 project-scoped skips plus one duplicate mobile fixture-export test. New functional journeys ran in both browser projects. The additional accessibility matrix completed **96 scans / zero violations**; **660 primary before/after PNGs** cover the original and final application, including all six final EN/AR widths. All twelve contact sheets were visually inspected. Actual source and artifact paths are enumerated in [changed-files.json](../artifacts/phase18/changed-files.json).

Independent read-only review found and resolved: budget amount/period conflict pairing, canonical office/studio vocabulary, same-path query filter updates, property-cohort links, matching-source revision checks, task draft replacement, stale confirmation and feature chapter labels. Browser verification additionally found proposal keyboard wrap and existing portal/channel-intent shadowing; fixes preserve old assertions. [Review](../openspec/changes/0022-connected-crm-productivity/review.md).

## Production prerequisites and limits

No production backend/AI/provider was implemented. Build a separately authorized custom Frappe app with authenticated session/membership, server-derived organization authorization, list/document/file/RPC/job isolation, durable revisions, transactions, audit/outbox/idempotency, encrypted server credentials, secure media and retention/backup controls. The browser envelope/snapshot token is editable demo state, not security or a multiuser lock. No real personal data or credentials belong here.

AI requires server-side provider configuration, source/permission checks, structured tool/proposal contracts, human approvals, revision enforcement, evaluations, usage/cost limits, trace redaction, timeout/fallback and uploaded-content safety. The deterministic label parser is deliberately narrower than a language model. Full Arabic editorial approval, native devices, Safari/Firefox, assistive technology and participant usability research remain pending.

Official portal contracts/feed rights and account/country capabilities must be verified before any real adapter. Meta housing category/targeting and advertiser permissions, current 2026 Google Ads onboarding and supported campaign access, WhatsApp consent/service-window/template/STOP enforcement, eligible GBP capabilities, GA4 consent/event governance and commercial payment terms need current official documentation and stakeholder/provider approvals. No older developer-token assumption, scraping, unofficial automation, live notification/calendar delivery or cross-platform attribution is introduced here.

Recommended next milestone: approve the Frappe schema/permission/revision contracts and implement one authenticated internal property/CRM slice with durable task/requirements persistence and isolation tests, before connecting one officially authorized provider sandbox. Do not migrate fictional aliases or browser permissions into production identities.
