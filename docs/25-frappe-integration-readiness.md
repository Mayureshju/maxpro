# Frontend to Frappe integration readiness

Phase 6, 13 November 2026. Design contract only. The next implementation is a **custom Frappe Framework application**, with the existing Next.js frontend. No backend, authentication, network repository, provider SDK, database connection or credential has been added. Exact Frappe/database/deployment versions remain unresolved; this phase does not pin unverified versions. This supersedes the historical instruction in document 22 to pin versions in Phase 6.

## Frontend boundary

`apps/web/src/lib/prototype-repository.ts` exposes typed property, organization, publishing, CRM and campaign commands. `api-contracts.ts` defines the proposed scoped asynchronous read/query/result contract, pagination, loading/empty/error states and revision/approval/acknowledgment DTOs. Existing canonical/domain DTOs remain the application vocabulary after adapter mapping; Frappe `name`, resource `data`, RPC `message`, document permission metadata and timestamp formats belong in the future adapter. The read facade returns frontend domain values; the Frappe transport must encode money in integer minor units with explicit currency and map it to display QAR values. Default list size is proposed as 25, capped at 100, with opaque next cursors, explicit ordering and server-allowlisted filters; bilingual search must match both original languages.

Do not send `DemoState`, browser slice maps, local persona, fictional aliases or local plan overrides to production as identity authority.

Production operations require an organization context, server authenticated membership, command digest/idempotency key and expected revision. Resolve actor and allowed organization on the server. Reject cross-organization linked properties, configurations, approvals, campaigns, lead/viewing records and private files. An organization selection in the browser is a request, not authority. The browser adapter is synchronous and bounded; it cannot prove server idempotency, isolation or concurrency safety.

## Workflow and DocType mapping

| Frontend workflow | Proposed authoritative DocTypes | Required transaction / worker boundary |
|---|---|---|
| Create organization, fictional personas and membership editor | Organization, Membership, Frappe User/roles | Create owner atomically; invite expiry/token; last-owner protection; reserve seats; no client role escalation |
| Canonical draft/source/review/media/archive | Property, Property Revision, Property Media, File, Verification | Expected revision; invalidate dependent reviews/approvals; secure upload intent, scan/EXIF/rights processing after commit |
| Connector preparation, marketplace and export preview | Connector Definition, Connector Configuration | Versioned authorized capability/market/contract; encrypted server secret; feed URLs signed, revocable and scoped |
| Preflight/approval/dispatch/retry/cancel/history | Publishing Approval, Publishing Job/Attempt, Outbox, Idempotency Receipt | Reserve quotas + immutable payload snapshot + audit/outbox atomically; workers recheck permissions/config/revision; partner acknowledgment alone changes remote status |
| Lead intake/dedupe/routing/inbox | Lead, Intake Receipt, Assignment Decision, Conversation/Message | Verify provider signature; unique organization/source/event; atomic rotating cursor; reject unknown property; consent enforced before send |
| Viewing request/confirm/cancel/complete | Viewing, Membership | Date/timezone/conflict locking; external calendar invitations are separate worker outcomes |
| Campaign copy/budget/creative/policy/advertiser/admin approvals | Campaign, Campaign Approval, AI Proposal, Credit Ledger | Draft revision plus ordered approval fingerprints; any material edit invalidates approval; credit reservation/settlement; spend requires server approval |
| Meta/Google/GA4 plans and attribution | Measurement Configuration, Consent, Attribution Event, Campaign Cost | No browser secrets; verified intake/event dedupe; reconcile real cost before CPQL/ROI; purpose-bound consent |
| Branding and local portfolio preview | Organization Branding, Domain Request | Organization-scoped routing and public-safe projection; verified DNS/TLS before activation; no verification by browser click |
| Plan/quota/invoice/configuration | Plan Version, Entitlement/Reservation, Subscription, Invoice/Payment Receipt | Immutable commercial terms; authorized admin configuration; signed gateway webhook settlement; no client price/paid-state authority |
| Moderation/operational settings/audit | Verification/Review, Operational Policy, Audit Event | Reviewer role + reason + revision; append-only server audit with redaction; scoped administrator elevation |

## Permissions

The six demo personas and central command matrix are UX examples. Production permission policy must specify landlord/broker ownership, agent assigned-record scope, manager assignment/review scope, owner billing/profile/membership powers, and separately audited super-administrator access. Deny suspended membership/organization operations. Recheck every list, detail, mutation, export, private file, RPC and background job. Use Frappe document/query permissions and explicit linked-record checks; generic list filters or whitelisting alone are insufficient. Decide shared-site versus site-per-tenant architecture separately.

Use secure HTTP-only session cookies, CSRF, revocation/logout, administrator MFA, invitation expiry and reviewed CORS/origin policy. Never trust simulated `role` fields in campaign commands or actor names in local audit entries. Credentials belong in reviewed server-encrypted storage. Define redaction, retention, evidence access and legal holds before storing real personal data.

## API and UI state policy

| State / response | Frontend behavior |
|---|---|
| Initial read / empty list | Semantic loading status; selected organization remains visible; empty action creates a draft without substituting another tenant’s fixture |
| 401 / 403 / 404 | Session recovery / access denied / unavailable record with safe navigation; no fixture substitution |
| 409 revision conflict | Preserve local draft, fetch current revision, show explicit comparison/review; invalidate approval; no silent overwrite |
| 422 validation | Stable translated message keys and field paths; focus first error; keep entered draft |
| 429 rate limit | Preserve draft; show retry-after; no automatic spend or repeated mutation |
| Timeout / 503 | Keep draft and idempotency key; explicit retry; reconcile uncertain outcome before resubmitting |
| Queued / blocked / rejected / accepted | Separate command approval, committed outbox, worker attempt and verified remote acknowledgment; show timestamp/provenance |

`ResourceState` is a frontend contract, not evidence of implemented network error screens. Current screens demonstrate local loading, empty, denied, invalid and stale-state recovery. Timeout/session-expiry/rate-limit behavior requires the future asynchronous adapter and contract fixtures.

## Background boundaries and invariants

Use Frappe-managed transactions and post-commit jobs to process committed outbox intents. Separate media, export/feed refresh, portal dispatch, lead intake, messaging, marketing, AI and reconciliation concerns as appropriate for the chosen release. Persist attempts, bound retries/backoff, quarantine permanent failures and reconcile late acknowledgments after cancellation. Do not introduce NestJS, Fastify, BullMQ or a second business backend.

Concurrency acceptance before integration: organization A cannot read/list/write/export/download/queue organization B; duplicate webhook cannot rotate assignment or create another lead; repeated idempotency key with different digest conflicts; edit versus approve invalidates stale receipt; publish/invite versus downgrade cannot exceed reservations; retry versus cancel cannot duplicate delivery/spend; last owner cannot be removed concurrently. Audit and outbox must commit with the business command. Browser tests cannot establish these production guarantees.

## Decisions still required

Supported Frappe/database version and deployment topology; independent schema/security review; authenticated session deployment; agent record scopes; legal entity/brand; licensed imagery; country licensing policy; portal contracts/sandboxes; Meta/Google/WhatsApp approvals; payment gateway/tax policy; data residency/retention; production translations and native-speaker UAT; monitoring, backup/restore and worker recovery.

## Official references checked

On 13 November 2026 the official [REST documentation](https://docs.frappe.io/framework/user/en/api/rest) documents resource APIs and whitelisted RPC; [background jobs](https://docs.frappe.io/framework/user/en/api/background_jobs) documents worker queues and after-commit enqueueing. The indexed official [security guidance](https://docs.frappe.io/framework-git/security/security-best-practices) explains explicit permission checks, `get_all` bypass, CSRF and encrypted secrets; direct retrieval returned 404 during this audit, so recheck that guidance against the pinned release. These references describe framework mechanisms, not built-in enforcement of MaxPro business invariants. Proposed DocTypes/endpoints above are MaxPro design decisions.
