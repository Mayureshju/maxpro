# Phase 2 — Connector Hub and syndication prototype

Implemented against [OpenSpec change 0006](../openspec/changes/0006-connector-hub-prototype/proposal.md). The operator works with the same fictional organization and browser-local canonical records introduced in Phase 1. No backend, official provider adapter, external account, credential, public feed endpoint or external acknowledgment is implemented. No commit, push or deployment.

## Implementation and audit

The original directory already filtered named providers, but setup quotas were only disabled-button checks. Mapping labels were derived from display strings; feeds always exported AQ-10231 regardless of saved properties. History showed only a flat local outcome with no recovery actions. The workbench duplicated readiness checks and lacked mapping versions.

Provider definitions now carry structured internal demo metadata: category, region, illustrative eligibility/operations, proposed integration mechanism, prerequisites, permissions, output formats, mapping version, validation policy and entitlement class. Real contractual authorization stays unverified and remote connectivity stays none. Preparation is an independent persisted local state. Bayut / Dubizzle remains blocked pending partner/country confirmation even after local setup. Analytics, messaging, ads and AI planning connectors do not acquire a fictional property export adapter.

The shared engine normalizes current canonical facts, applies typed/versioned internal destination mappings, reports required fields and canonical example-policy errors, then produces readable XML/JSON/CSV and a local file download. XML escapes metacharacters and replaces forbidden XML 1.0 characters; JSON retains Unicode and nulls invalid numbers; CSV quotes every cell, doubles embedded quotes and prefixes spreadsheet formula triggers. Any saved property, including a new incomplete draft, can be inspected. Preview refreshes with its revision. Generated files identify their internal illustrative contract and remote_sent=false; they are never official submissions. The misleading prototype token-rotation widget was removed; no token or endpoint is generated.

Publishing and retry use current revision/configuration/plan/mapping approval context at command time. Shared validation yields independent ready, validation-blocked or setup/eligibility-blocked destinations. Local jobs retain mapping, revision, reasons and append-only attempt snapshots. Retry reruns current checks and can remain blocked; cancellation releases local quota reservations. The UI retains the recorded outcome and separately flags revalidation when the canonical revision changes; filters use that current state. Local queue state never means dispatch or acceptance.

Persistence preserves the existing schemaVersion 1 property envelope and adds connectorSchemaVersion 2. Old jobs without connector metadata migrate into explicitly legacy mapping snapshots; malformed new fields/attempts are excluded with a visible recovery message. Known fields only are restored; no external IDs are admitted. Attempts are bounded at 100, jobs at 500 and the browser store at 4 MB. These are prototype capacity limits, not durable audit infrastructure.

## GEM coverage

| ID | Delivered internal prototype behavior | Production dependency |
| --- | --- | --- |
| GEM-05 | Shared canonical + mapped-field validation and actionable missing fields | Official rules, licensing/ownership evidence and server validation |
| GEM-06 | Search/category directory, six-section detail, local setup/removal | Organization authorization and real onboarding |
| GEM-07 | Named providers with versioned internal contract examples and eligibility distinctions | Agreed geographic access, official schema and transport |
| GEM-08 | Current-revision human review, independent local jobs, retry/cancel and attempts | Outbox, durable queue, idempotency, authorized dispatch and acknowledgment |
| GEM-09 | Actual property-dependent XML/JSON/CSV preview, mapping inspector and download | Signed tenant endpoint, keys/rotation, schedules and fetch logs |
| GEM-18 | Setup and publish/retry command guards for illustrative plans, cancellation releases reservations | Transactional backend entitlements and approved commercial terms |
| GEM-20 | Property/destination/status/date filters, current/attempted revisions, validation errors and local diagnostics | Telemetry, rate limits, reconciliation, incidents and alerts |

The authoritative coverage matrix is updated in [11-gemini-requirements.md](11-gemini-requirements.md). Commercial examples remain QAR 179 / 725 / 1,800+, illustrative pending approval.

## Changed files

- `apps/web/src/lib/gemini-product.ts`: structured connector capability definitions.
- `apps/web/src/lib/connector-engine.ts`: normalized export, illustrative mappings, validation and serializers.
- `apps/web/src/lib/syndication-engine.ts`: shared readiness, quotas, approval context, command guard and status projections.
- `apps/web/src/lib/canonical-property.ts`, `property-storage.ts`: local job/attempt types and runtime migration/validation.
- `apps/web/src/components/gemini/demo-provider.tsx`: guarded setup, publishing, retry/cancellation and persistence.
- `connectors.tsx`, `feed-preview.tsx`, `syndication.tsx`, `publishing-activity.tsx`, `distribution.tsx`, `measurement.tsx`, `agency-operations.tsx`: connected operational UI and truthful reservation copy.
- `apps/web/src/app/[locale]/workspace/hub/{feeds,jobs,mappings}/page.tsx`: Suspense boundaries for contextual pickers/filters.
- `apps/web/src/app/globals.css`: bounded operational grids/tables, filters, section navigation and job inspector.
- `apps/web/tests/e2e/connector-hub.spec.ts`: export/guard/migration tests and EN/AR desktop/mobile browser workflows.
- `.github/workflows/ci.yml`: committed frozen lockfile installs; existing checks retained; focused production-server connector smoke job and artifacts.
- `openspec/changes/0006-connector-hub-prototype/`, `docs/11-gemini-requirements.md`, this report and `artifacts/phase2/`: specification, traceability and evidence.

## Verification

Final verification completed against the final source and supported webpack production build. Logs are under [artifacts/phase2/logs](../artifacts/phase2/logs).

- Frozen dependency installation: network install completed after offline cache attempts failed. Existing lockfile unchanged.
- `pnpm typecheck`: passed.
- `pnpm lint`: passed.
- `pnpm build`: default Turbopack failed under sandbox host restrictions creating a process/binding a port (`Operation not permitted`). This is a failed default build, not a pass.
- `pnpm --dir apps/web build --webpack`: final supported diagnostic production build passed.
- `pnpm --dir apps/web test:e2e connector-hub.spec.ts --grep 'connector smoke' --workers=2`: **12 passed** on the final production build. See [ci-smoke.log](../artifacts/phase2/logs/ci-smoke.log). This is the exact focused command added to CI; no remote Actions run is claimed.
- `pnpm --dir apps/web test:e2e`: **572 passed, 4 intentional skips** (576 cases total), including **32 new Phase 2 cases**. All unchanged Phase 0/1 regression tests passed. See [e2e-final.log](../artifacts/phase2/logs/e2e-final.log). The four pre-existing skips cover desktop/mobile-only applicability.
- `git diff --check`: passed. Prior Phase 1 screenshots were restored after preserving current workbench evidence under Phase 2; no regression test source was changed.

Browser verification uses `PLAYWRIGHT_PORT=3106 PLAYWRIGHT_PRODUCTION=1` and the installed Chrome executable through `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'`. The runner starts/stops the local production server. CI installs Playwright Chromium and uses its default executable.

An initial regression attempt reused a pre-existing port 3000 server with broken hydration/HMR. Verification moved to isolated port 3106 and the webpack production server. The first dedicated connector run caught provider-table mobile overflow; the grid was constrained before final verification. The first full regression run exposed hidden filter-option text intercepting a legacy lookup and historical outcomes being replaced by current revalidation labels; distinct filter wording and separate recorded/current state displays correct both without changing existing tests. Earlier failures remain in logs and are not represented as passes.

## Browser review and UX

Actual running Next.js screenshots are stored in [artifacts/phase2/screenshots](../artifacts/phase2/screenshots), covering English and Arabic at 1440, 1024, 768 and 375 pixels, including directory, provider detail, feed, publishing and history. Additional populated inspectors and newly created property feed screens are captured per project/locale. Representative screenshots inspected directly:

| Width | English | Arabic |
| --- | --- | --- |
| 1440 | [Directory](../artifacts/phase2/screenshots/en-1440-directory.png) | [Directory](../artifacts/phase2/screenshots/ar-1440-directory.png) |
| 1024 | [Feed](../artifacts/phase2/screenshots/en-1024-feed.png) | [Feed](../artifacts/phase2/screenshots/ar-1024-feed.png) |
| 768 | [Provider](../artifacts/phase2/screenshots/en-768-provider.png) | [Provider](../artifacts/phase2/screenshots/ar-768-provider.png) |
| 375 | [Provider](../artifacts/phase2/screenshots/en-375-provider.png) | [Populated job inspector](../artifacts/phase2/screenshots/mobile-chromium-ar-job-inspector.png) |

All 68 Phase 2 captures (56 connector screens plus 12 lifecycle preflight/dispatch views) are actual browser output. Dimensions and filenames are listed in [manifest.json](../artifacts/phase2/screenshots/manifest.json). The final layout constrains mapping tables inside scrollable regions, separates recovery buttons on mobile, and keeps code LTR inside Arabic pages. Page-width assertions cover each required breakpoint and populated inspector flows.

Additional workbench evidence: [EN preflight](../artifacts/phase2/screenshots/lifecycle-chromium-en-preflight.png), [AR mobile preflight](../artifacts/phase2/screenshots/lifecycle-mobile-chromium-ar-preflight.png), [AR dispatch](../artifacts/phase2/screenshots/lifecycle-chromium-ar-dispatch.png).

Task-specific compositions preserve the editorial typography and restrained green/stone palette. Directory rows support discovery; anchored provider sections expose requirements; required values sit next to saved data in bounded mapping tables; the ledger uses compact filters and an inline contextual inspector. Tables scroll inside keyboard-focusable regions instead of expanding the page. Primary touched Arabic actions and headings are translated, and code output remains LTR in RTL routes.

## Limits, review prerequisite and next milestone

All mappings/policies and plan examples are internal illustrations. No unavailable official documentation was guessed. Regional rights, partner schemas, authorized transport, housing-ad eligibility and real scopes require supplied partner documentation before a production adapter can be built. No credentials or customer data should be placed in browser-local state.

Browser storage can be edited by its owner; local commands demonstrate application boundaries, not production authorization or tenant isolation. In-memory fallback is available when storage fails. Uploaded media remains metadata only; bundled fictional assets support local example checks.

Professional Arabic completion and native-speaker UAT are still required. This is Chromium desktop and mobile emulation, not Safari/Firefox or physical-device certification. CI configuration is authored and the smoke command is exercised locally; no remote GitHub Actions run is claimed.

AGENTS.md requires one author and a separate reviewing tool. Claude Code was invoked read-only against this change and returned “Not logged in · Please run /login”; see [independent-review.log](../artifacts/phase2/logs/independent-review.log). Independent second-tool review remains an authentication prerequisite. Automated tests and implementation self-review do not substitute for it.

Recommended next prototype milestone: connect lead intake, CRM assignment and channel attribution (GEM-13, GEM-14, GEM-24) to these same canonical property/destination IDs using explicitly fictional inbound examples. Keep webhooks, messaging and analytics delivery local until authorized production foundations and official provider contracts are approved. Obtain the partner schema/region agreement before any real publishing adapter or acknowledgment workflow.
