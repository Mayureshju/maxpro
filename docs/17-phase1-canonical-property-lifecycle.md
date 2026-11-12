# Phase 1 — canonical property lifecycle

Implemented against [OpenSpec change 0005](../openspec/changes/0005-canonical-property-lifecycle/proposal.md), for an agency operator in one fictional organization. This is a browser-local interactive prototype; no backend, AI extraction, portal, advertising, payment or messaging service was connected. No commit, push or deployment was made.

## Result and requirements

| Requirement | Behavior delivered |
| --- | --- |
| GEM-02 | Stable UUID-based demo creation; incomplete draft saves; reload/resume; canonical inventory search/filter/detail; revision history; archive/resume; unknown-ID recovery without fixture fallback |
| GEM-03 | Canonical EN/AR titles/descriptions, Arabic route direction and translated primary actions; English content stays LTR inside Arabic workspaces |
| GEM-04 | Shared ordered media metadata; room categorization, availability, removal and watermark preview persist; keyboard reorder; explicitly fictional simulation assets; selected file bytes and blob URLs never persist |
| GEM-05 | Preflight reads current canonical facts, human review and available categorized assets; floor-plan example policy is independent by destination |
| GEM-08 | New records can be selected or deep-linked into publishing; per-destination queued-local/blocked-local attempts snapshot revision and reasons; property references and global history survive reload; no remote acceptance or external IDs |
| GEM-18 | Starter/Pro reserve 3/25 distinct locally queued properties and 1/2 distinct portal destinations; existing reservations count across properties; Starter excludes Meta catalogue; incomplete drafts remain saveable beyond queue quotas |
| GEM-21 | Supplied notes, manually entered facts, proposed bilingual copy and human-approved content are distinct; arbitrary text/document/voice input produces no fabricated extraction; explicit review saves proposed content into the same canonical property |

`CanonicalProperty` owns facts, source/review metadata, proposed copy, ordered media, revision events and publication references. `propertyListing` is a read-only projection for existing visual components. The static fixture array remains a seed and optional public showcase source, never an editable second operational store. Seed facts now derive from that array rather than a duplicate table of property identities/prices.

The existing provider stores a versioned envelope, validates and projects known fields, migrates valid Phase 0 overrides, rejects malformed records/jobs, rebuilds publication references, excludes duplicate identifiers, bounds metadata and reports storage failures. It does not silently replace an invalid requested property with another sample. Cross-tab changes invalidate publishing consent and stale editor/Studio saves. This is not transactional or secure multi-tenant storage.

New properties use `/workspace/inventory/new`. Editor, media, Studio, publishing and history links carry the property ID. Studio progress also saves the canonical ID in its URL so reload resumes the same work.

## Changed files

Paths under `apps/web/`:

| Files | Purpose |
| --- | --- |
| `src/lib/canonical-property.ts`, `src/lib/property-storage.ts` | Domain contract, factories/seeds, revisions, preflight, projections and runtime decoding |
| `src/lib/gemini-product.ts`, `src/lib/prototype-data.ts` | Existing centralized plan/connector definitions retained; seed factory deduplicated, draft payment/furnishing fields and truthful operational statuses |
| `src/components/gemini/demo-provider.tsx` | Shared repository, migration, persistence, revision/approval/quota guards and local destination attempts |
| `src/components/gemini/property-state.tsx` | Hydration and unknown-property recovery |
| `src/components/prototype/inventory.tsx` | Create flow, searchable semantic table/gallery, canonical detail and revision history |
| `src/components/gemini/listing-editor.tsx` | Canonical save, incomplete drafts, human-review state, contextual current-state validation |
| `src/components/gemini/media.tsx` | Persistent ordered media metadata and session-only file preview |
| `src/components/prototype/studio.tsx` | Guided source/manual facts/media/proposed bilingual copy/approval/handoff workflow |
| `src/components/gemini/syndication.tsx`, `distribution.tsx` | Canonical destination preflight, context-sensitive consent, local attempts and per-revision history |
| `src/components/gemini/agency-operations.tsx` | Canonical record and quota usage counts in existing dashboard/billing layouts |
| `src/components/gemini/measurement.tsx` | Reset confirmation explicitly warns that saved properties and Studio work are removed |
| `src/components/workspace/workspace-shell.tsx` | Shared illustrative-pending-approval pricing disclosure |
| `src/app/[locale]/workspace/inventory/new/page.tsx`, inventory `[id]` detail/edit/media/publishing/enquiries pages | Create route and client repository resolution for browser-created IDs |
| `src/app/[locale]/workspace/studio/page.tsx`, `publish/page.tsx` | Suspense boundaries for property query selection |
| `src/app/globals.css` | Semantic table styling, long-ID wrapping, responsive records, keyboard scroll focus and RTL arrows |
| `tests/e2e/lifecycle.spec.ts` | Sixteen new scenarios per desktop/mobile project, including complete EN/AR lifecycle and corruption/quota/concurrency checks |
| `tests/e2e/prototype.spec.ts`, `stability.spec.ts` | Preserve earlier regressions with explicit fictional input/review actions, semantic table links and Phase 1 screenshot output |

Documentation: this report, `docs/11-gemini-requirements.md`, and the proposal/design/tasks/acceptance specification in change 0005. No manifest or lockfile changes.

## Verification evidence

Logs: [artifacts/phase1/logs](../artifacts/phase1/logs/). Final full-suite output: [e2e-final.log](../artifacts/phase1/logs/e2e-final.log). Preserved HTML report: [playwright-report-full/index.html](../artifacts/phase1/playwright-report-full/index.html).

| Command/check | Actual result |
| --- | --- |
| `CI=true pnpm install --frozen-lockfile` | PASS. Initial offline attempt lacked cached tarballs; restricted-network attempt failed DNS; registry-enabled install completed with 382 packages. pnpm reported ignored existing optional build scripts for `@parcel/watcher` and `@swc/core`. |
| Unchanged Phase 0 `pnpm typecheck`, `pnpm lint` | PASS |
| Unchanged Phase 0 production build using `pnpm --dir apps/web exec next build --webpack` | PASS |
| Unchanged Phase 0 `pnpm --dir apps/web test:e2e` with environment below | 504 passed, 4 intentional skips |
| Phase 1 `pnpm typecheck` | PASS |
| Phase 1 `pnpm lint` | PASS, no warnings |
| `pnpm build` | BLOCKED by environment: Turbopack CSS worker cannot bind a port (`Operation not permitted`), also reproduced before implementation and after execution escalation. |
| `pnpm --dir apps/web exec next build --webpack` | PASS, complete production build with unchanged framework/dependencies and supported alternate bundler. Default build script was preserved. |
| Focused lifecycle run before final visual refinements | 28 passed; four additional project cases were added for stale Studio edits and cross-property portal reservations. |
| Focused complete-journey screenshot refresh | 4 passed (EN/AR × desktop/mobile) after capture framing changes; the final full suite also passed after the later media empty-state refinement. |
| Final full Playwright suite | PASS, exit 0: 540 passed, 4 intentional skips in 3.1 minutes, including all 32 new lifecycle cases, on the final application source. |
| `git diff --check` | PASS |
| Independent second-tool review | Attempted installed Claude Code in restricted read-only mode; returned `Not logged in`. No review completed. Authentication is a remaining prerequisite; [attempt log](../artifacts/phase1/logs/independent-review.log). |

Browser environment:

```sh
PLAYWRIGHT_PORT=3100 \
PLAYWRIGHT_PRODUCTION=1 \
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH='/Users/dieturetech/Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing' \
pnpm --dir apps/web test:e2e
```

Four skips are intentional: tablet assertions run only in the desktop project, and drawer-specific assertions run only in the mobile project. Route checks cover all 78 page templates with representative dynamic IDs in EN/AR and desktop/mobile; additional lifecycle tests exercise newly created IDs and recovery states.

This uses the actual Next.js production app and cached Chromium 145.0.7632.6, with desktop and iPhone-size Chromium emulation. It is not native Safari or physical-device testing. Existing Playwright default browser revision was absent. Playwright owns the temporary server on 3100 and shuts it down on completion.

Initial new tests exposed the manual-source Studio intake branch; it was fixed. Several initial assertions matched Next.js's route-announcer alert alongside the application alert; those assertions were scoped to main content. Subsequent lifecycle verification passed. No functionality was removed to satisfy tests.

## Screenshots and UX review

62 actual running-app lifecycle captures are under [artifacts/phase1/screenshots](../artifacts/phase1/screenshots/). 56 existing workflow captures are under [artifacts/phase1/regression-screenshots](../artifacts/phase1/regression-screenshots/); Phase 0 committed evidence was preserved.

Representative views:

- [English desktop creation](../artifacts/phase1/screenshots/chromium-en-create.png)
- [Arabic mobile local dispatch](../artifacts/phase1/screenshots/mobile-chromium-ar-dispatch.png)

- [English desktop inventory](../artifacts/phase1/screenshots/chromium-en-inventory.png)
- [English mobile editor](../artifacts/phase1/screenshots/mobile-chromium-en-editor.png)
- [Arabic desktop bilingual Studio](../artifacts/phase1/screenshots/chromium-ar-studio-copy.png)
- [Arabic mobile media](../artifacts/phase1/screenshots/mobile-chromium-ar-media.png)
- [English 768px media](../artifacts/phase1/screenshots/chromium-en-768-media.png)
- [English 1024px destination preflight](../artifacts/phase1/screenshots/chromium-en-1024-preflight.png)
- [Arabic mobile preflight](../artifacts/phase1/screenshots/mobile-chromium-ar-preflight.png)
- [English mobile status history](../artifacts/phase1/screenshots/mobile-chromium-en-job-history.png)

Inspected inventory, editor, media, bilingual Studio, preflight and populated history across desktop/tablet/mobile and EN/AR. Replaced the blank no-media detail hero with an explicit gallery empty state and media action. Fixed English text inheriting RTL, mirrored workflow arrows, wrapped long stable IDs, and moved destination/status ahead of job IDs so local outcomes are visible immediately on mobile. Wide tables retain keyboard-focusable horizontal scrolling. Full-page captures scroll to the document top to avoid sticky-sidebar framing offsets. Existing warm stone/eucalyptus editorial styling and task-specific layouts remain intact.

## Remaining limits and next milestone

- Browser-local fictional state only, one fixed demo organization. No production API, authentication, authorization, tenant isolation, durable outbox, real billing, AI or provider acknowledgments. Local storage can be edited/cleared and is not a security boundary.
- Raw selected files have session previews and persistent metadata only; they cannot satisfy delivery checks. Only explicitly fictional samples can satisfy the local availability policy. Floor plans are labelled sample metadata, not proof of a real floor-plan upload. Secure storage, scanning, image processing and licensed Qatar media remain future work.
- Review provenance is at record/source level; per-field evidence, immutable durable revision snapshots and reviewer identities require the API milestone. Local history is bounded to 200 property events / 500 job attempts and 500 persisted properties, with a 4 MB persistence envelope; quota reservations remain until an explicit demo reset.
- Legacy public showcase, CRM and unrelated operational samples remain secondary/static where outside this vertical slice. New operational properties are not automatically added to the public showcase.
- Full Arabic translation, native-speaker review, independent accessibility/design signoff and cross-browser/device UAT remain pending. The prototype does not claim complete Arabic coverage or full WCAG conformance.
- Independent second-tool review requires an authenticated reviewing tool. The default Turbopack build still requires a host that permits its worker port; the webpack production build is verified here.

Recommended next OpenSpec milestone: **0006 — tenant-scoped property API and durable media repository**, bounded to OIDC organization membership, PostgreSQL property/translation/media/revision contracts, authenticated draft/revision persistence, secure object storage and an immutable approval/audit boundary. Keep portal adapters and externally accepted statuses gated by separately approved partner contracts and acknowledgement evidence. Do not infer backend or integration authorization from this prototype change.
