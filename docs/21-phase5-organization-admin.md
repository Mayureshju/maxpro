# Phase 5 — Organization and administration prototype

Implements OpenSpec `0009-organization-admin` for **GEM-01, GEM-17, GEM-18, GEM-19 and GEM-20**, extending the Phase 1–4 canonical workflows. Baseline `4cfdf2babb74d5121a6de0fc7c2d476d8ce4dc99` matched the latest pushed main. Exact [baseline CI run 43360733724](https://github.com/Mayureshju/maxpro/actions/runs/43360733724) succeeded. No commit, push, deployment, backend service or live integration was made.

## Delivered behavior

Register or `/workspace/organization/new` creates a fictional directory organization with country/type, a starter plan selection and a fictional owner/member record. The directory inspector edits business/licensing data, status and plan and opens that organization's members. Canonical operations remain explicitly in the Pearl Gate demo workspace; inspecting a directory organization never switches or silently reassigns Phase 1–4 properties, leads, campaigns or connector jobs. This is not production multi-tenancy or an operational organization switcher.

Organization profile, preferences, licensing request and branding/domain forms persist in the shared repository. Reserved `.example` domains have a saved local checklist preview, always DNS/TLS unverified. Business/license changes reset the local verification request. No documents, emails, DNS checks, accounts or secrets are transmitted. Public showcase routes remain secondary. A new-campaign administrator-review preference supplies the default for future drafts; existing receipts remain revision-bound and cannot be bypassed by changing that preference.

The team table edits role/status/availability with optimistic membership revisions and simulated invitations. Active and invited memberships reserve illustrative seats; suspension releases a seat, and activation consumes it. At least one active agency owner must remain. Managers cannot promote/change owners. Availability and membership status feed the existing round-robin dispatcher; newly activated fictional aliases can be assigned and retain CRM history across reloads. History retains original assignee aliases when a member is suspended.

A global selector demonstrates landlord, broker, agent, manager, owner and super-administrator roles. `organization-engine.ts` supplies the single matrix used by UI and command guards. Property creation/editing, connector preparation, publishing/retry/cancel, lead assignment/availability, campaign edits/approvals, billing and administrative commands consult it. Forbidden commands return an error and local denied audit event. The role selector represents fictional persona capabilities, not a logged-in user's membership; users can change it freely. Browser controls offer no real authentication, authorization, tenant isolation or tamper resistance. Real security belongs in Frappe.

Moderation reads the canonical property repository. Pending review, approved in demo, changes requested, rejected and verification pending decisions record note, selected fictional actor, timestamp and property revision. Stale review submissions fail. Canonical revisions invalidate an existing moderation decision into verification pending with audit in the same update that invalidates campaign approvals. An existing unresolved moderation decision blocks later local publishing; never-reviewed examples retain the established Phase 1–4 source/preflight journey. Source review, moderation, legal verification and partner acceptance remain separate. Previously queued jobs retain their original revision and show revalidation required; they never become remotely accepted from a local click.

Subscription screens use Gemini defaults QAR 179 / 725 / 1,800+, with listing limits 3 / 25 / negotiated and portal limits 1 / 2 / all authorized. Seat and deterministic-proposal credit examples remain provisional. An administrator can configure bounded local overrides; publishing/setup/seat/credit commands and usage read effective terms. Usage derives from canonical records, queued property reservations, prepared/queued portal destinations, memberships and campaign proposals. Drafts do not reserve publishing capacity; cancellations release queue reservations. Example invoices and plan-change audit demonstrate history without any real charge, settlement, tax or payment gateway. Obsolete static organization/billing/admin implementations, including the conflicting QAR1,999 tier, were removed from the replaced module.

For compatibility with the retained prototype, the plan buttons apply a local selection immediately and show impact; a separate upgrade/downgrade preview does not change the selected plan. An over-limit downgrade preserves existing records and shows overages, while subsequent consuming operations enforce their relevant quotas. It is not a real commercial downgrade or transaction. Invoice examples reflect current illustrative configuration, not legally immutable historic invoice amounts. A production billing ledger must snapshot approved terms.

The administration navigation connects organization/member tables, canonical moderation inspector, plan configuration, retained connector diagnostics, operational settings and filtered audit. Legacy admin CMS/reports routes now show the operational-settings/audit workspaces respectively; no content publishing or live financial reporting is claimed. Dispatch pause blocks new publishing/retry simulations while cancellation can still release reservations. Audit includes profile/team/plan/review actions, property revisions, connector/job operations, CRM/campaign actions and denied permissions; it is bounded editable browser history, not immutable production audit. Search/filter/empty/success/validation/denied states use existing editorial/operational components.

## Repository and Frappe boundary

The only persisted envelope remains `maxpro-gemini-v3-demo-state`: schema 1, connector 2, CRM 1 and campaign 1 are preserved; additive `organizationSchemaVersion:1` and organization repository version 1 migrate older valid state. Limits: 50 organizations, 100 memberships per organization (500 across hydration), 500 reviews, 1,000 audit events and the existing 4MB overall storage guard. Hydration projects known fields, validates foreign keys, roles/statuses, finite terms and revisions, excludes invalid records with a warning, repairs a missing active agency owner and invalidates stale property reviews. Valid unrelated Phase 1–4 state survives. Storage-denied/full uses memory with a visible warning; storage events synchronize tabs.

`prototype-repository.ts` defines asynchronous typed snapshot and organization/property/publishing/CRM/campaign command interfaces, error mapping and transport metadata. Its only adapter delegates to the existing local guarded store. Expected revisions remain part of domain commands; idempotency metadata is a future server contract, with no local durable retry/deduplication guarantee. UI hooks retain synchronous local convenience commands; introducing a real Frappe adapter will also require loading/error handling around asynchronous mutations.

The explicit Frappe decision supersedes NestJS/Fastify/BullMQ/OIDC proposals in earlier documents and the preserved original PRD's backend examples. AGENTS, source precedence, architecture contracts, delivery plan and README now agree on a future custom Frappe app. `22-frappe-backend-blueprint.md` defines proposed DocTypes/relationships, authoritative records vs views, authentication/role/organization isolation, document APIs vs custom whitelisted commands, business validation, transactions/concurrency, background jobs and partner acknowledgements. No Frappe or Python code is implemented.

## Verification

Final command results, screenshot inventory and known prerequisites are recorded below after the full browser run. Evidence is isolated under `artifacts/phase5/`; existing Phase 0–4 test sources remain intact. Initial focused tests passed 12 domain cases; early workflow checks exposed two incorrect new test selectors (searchbox versus textbox and the editor's existing save label), subsequently corrected. The first full production-browser run recorded **730 passed / 28 skipped / 4 failed**; all four failures were the new EN/AR desktop/mobile accessibility checks. Scoped text contrast and keyboard-focusable table regions were corrected, with no retained test source modified. The default Turbopack build reproduced the existing sandbox CSS/PostCSS subprocess port-binding `Operation not permitted`; use the separately verified supported Webpack build for production-browser testing.

## Remaining issues and Phase 6

Independent second-tool review is pending: installed Claude Code reports `loggedIn:false`, `authMethod:none` in `artifacts/phase5/logs/reviewer-auth.log`. No independent review pass is claimed. Professional Arabic/native-speaker UAT remains outstanding: new task labels and RTL are implemented, while errors, historical actions, provider terminology and some existing bodies remain English. Prototype gates do not constitute production security or legal/provider approval.

Directory organizations do not yet own separate operational datasets; professional product approval is required for the real organization switcher and agent own/assigned-record policy. Real billing periods/AI credit settlement, authoritative verification evidence, domain binding, immutable invoices/audit and concurrency enforcement require Frappe. First complete independent review and bilingual UAT, then approve/pin the Frappe release/database and implement isolated authenticated DocTypes/controllers behind the typed boundary. Prove organization isolation, concurrent quota/last-owner/approval invariants, durable outbox/audit and backup recovery before any officially authorized sandbox connector or payment integration. No live spend or commercial publishing follows from this prototype.

## Final evidence — 2026-11-13

| Gate | Actual result |
|---|---|
| `CI=true pnpm install --frozen-lockfile` | Passed with network-enabled execution; lockfile unchanged |
| `pnpm typecheck` | Passed |
| `pnpm lint` | Passed with no warnings |
| `pnpm build` | Failed: existing sandbox Turbopack CSS/PostCSS subprocess cannot bind a port (`Operation not permitted`); `logs/build-default.log` |
| `pnpm --dir apps/web exec next build --webpack` | Passed production build |
| Full `pnpm --dir apps/web test:e2e` against that build | **742 passed / 28 intentional skips / 0 failed**, 3.4 minutes; `logs/e2e-final.log` |
| New Phase 5 cases | **52 passed / 8 duplicate mobile screenshot jobs skipped**; also 12 automatically discovered new-route checks passed |
| Changed-content axe WCAG A/AA | **52 inspected states / 0 violations**, EN/AR × desktop/mobile; four `logs/axe-*.json` reports |
| Keyboard | Permission matrix focus and native horizontal scrolling passed in EN/AR at 375px |
| Browser screenshots | **104 PNGs**, thirteen screens × two locales × four widths; eight contact sheets inspected |
| Retained tests | Seven Phase 0–4 test/fixture sources unchanged, confirmed by SHA-256 in `retained-test-sources.json` |
| Independent second-tool review | Pending Claude Code authentication; no pass claimed |

Invocation:

```sh
PLAYWRIGHT_PORT=3155 \
PLAYWRIGHT_PRODUCTION=1 \
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
pnpm --dir apps/web test:e2e
```

The 28 skips are the 20 retained intentional skips and eight duplicate mobile screenshot jobs; each new screen is already captured at all four widths in Chromium. All property, connector, CRM and campaign regressions passed. The new cases cover onboarding/profile editing, invitations/role/status/availability, direct command denials, last-owner and seat reservation/release, configurable connector/credit quotas, all moderation decisions and stale revision invalidation, audit, async local repository error mapping, storage recovery/unavailability, cross-tab persistence, branding/verification and responsive bilingual workflows. The onboarding test asserts no external mutation request.

Screenshots cover onboarding, profile, team/matrix, subscription, brand/domain, verification, organization directory/inspector, moderation decision/receipt, plan configuration, audit, organization preferences, invoice examples and operational settings at 1440/1024/768/375. All eight contact sheets were visually inspected, plus enlarged EN desktop profile/billing and AR mobile moderation captures. Corrected contrast and form padding are present in the final images. Dense tables scroll inside their own keyboard-focusable regions; tests found no document overflow. Screenshot paths, pixel dimensions and SHA-256 hashes are in `artifacts/phase5/screenshot-manifest.json`; final results are in `artifacts/phase5/verification.json`.

Regression jobs overwrite historical Phase 1–4 captures/reports; those tracked artifacts were restored to the original baseline after the run. New evidence remains isolated in Phase 5. No app source or retained test changed after the final build/full test run. A final whitespace/diff check passed.
