# Phase 0 stabilization — 12 November 2026

Scope: repair the existing Next.js prototype against the Gemini PRD. No new product features, provider adapters, packages, commits, pushes or deployments. Requirements: GEM-02–09, GEM-12–20, GEM-24, plus GEM-03/22 for bilingual/mobile verification. Production GEM-23 remains design only.

## Repairs

- Restored React hooks in all seven affected Gemini components and the React `FormEvent` type for viewing requests. Fixed the connector callback's nullable definition reference.
- Replaced effect-driven demo-state initialization with a provider-scoped React external store that has a stable server snapshot, browser persistence and safe storage failure handling. Invalid plans, providers, jobs and property drafts cannot crash core routes. No credentials or new categories of user data are stored.
- Initialized the canonical editor from hydrated saved state without a state-setting effect. Browser reload and changed preflight values are regression tested.
- Fixed the final publishing step's disabled dispatch button. Approval, nonempty destination selection and quota checks still gate local dispatch. The pre-dispatch summary now distinguishes readiness from recorded jobs, and changing destinations invalidates the previous submission view.
- Handled rejected/unavailable clipboard access without an unhandled promise exception.
- Constrained native file inputs in AI Studio's mobile room grid and allowed workflow action buttons to wrap. The full mobile studio journey is tested through approval/handoff.
- Added the missing browser icon to remove favicon 404 console errors.
- Fixed lint errors/warnings without disabling source rules; generated Playwright reports/results are excluded from source linting.
- Repaired mobile menu keyboard focus, focus containment, Escape dismissal, expanded/control relationships and active-page semantics. Closed mobile navigation is hidden from keyboard traversal.
- Corrected displayed Starter/Pro prices to omit the Agency-only plus suffix. The navigable admin entitlement matrix now reads the centralized Gemini examples; removed generic portal placeholders from navigable admin/notification copy. All amounts remain illustrative pending approval.

## Changed source/config/test files

All paths below are relative to `apps/web/`.

| Files | Purpose |
|---|---|
| `src/components/gemini/connectors.tsx` | Hooks, nullable callback reference, clipboard handling, unused bindings |
| `src/components/gemini/measurement.tsx`, `distribution.tsx`, `lead-analytics.tsx` | Missing hooks/type imports and unused binding |
| `src/components/gemini/listing-editor.tsx` | Hooks, saved-draft hydration and escaped JSX text |
| `src/components/gemini/demo-provider.tsx` | Persisted demo-state initialization and validation |
| `src/components/gemini/agency-operations.tsx` | Hook import, image component and correct price suffix |
| `src/components/gemini/media.tsx` | Hook imports, image component and unused import |
| `src/components/gemini/syndication.tsx` | Final dispatch guard and truthful pre-dispatch status |
| `src/components/workspace/workspace-shell.tsx` | Mobile keyboard navigation and active-page semantics |
| `src/components/prototype/extended.tsx`, `relationships.tsx`, `studio.tsx` | Unused declarations; studio test/layout repairs preserve existing features |
| `src/components/prototype/operations.tsx` | Unused declarations, centralized admin tiers and provider copy |
| `src/app/globals.css` | Mobile file-input/action sizing and navigation visibility |
| `src/app/icon.svg` | Browser icon |
| `src/app/[locale]/pricing/page.tsx`, `src/components/marketing/site-footer.tsx` | Escaped JSX apostrophes |
| `postcss.config.mjs` | Named configuration export |
| `eslint.config.mjs` | Ignore generated browser reports/results |
| `playwright.config.ts` | Desktop/mobile projects, alternate local port, optional cached browser and production server |
| `tests/e2e/fixtures.ts`, `stability.spec.ts`, `prototype.spec.ts` | Browser error assertions, routes, workflows, screenshots, storage/clipboard and keyboard regressions |

Documentation: this report and `openspec/changes/0004-phase0-stabilization/{proposal.md,design.md,tasks.md,specs/stability/spec.md}`. Generated evidence is under `artifacts/phase0/`; The full-suite results are preserved in `artifacts/phase0/logs/e2e.log`. The final focused keyboard verification HTML report is `artifacts/phase0/playwright-report-keyboard/index.html`; the standard `apps/web/playwright-report/index.html` is overwritten by each test invocation.

## Commands and results

Commands executed from the repository root:

| Command | Result |
|---|---|
| `pnpm typecheck` | PASS, exit 0 |
| `pnpm lint` | PASS, exit 0, no warnings |
| `pnpm build` | PASS, exit 0, default Turbopack production build |
| `pnpm --dir apps/web test:e2e` with the environment below | PASS, exit 0: 504 passed, 4 intentionally skipped |
| Same command with `--grep 'mobile menu\|navigation .*follows\|keyboard can filter'` | PASS, exit 0: 8 passed, 2 intentionally skipped (final ref cleanup) |

The first typecheck and lint failed on the reported missing imports and additional errors; those failures were repaired. The first sandboxed build failed because Turbopack could not bind a local CSS-worker port, and succeeded with the required execution permission. An initial browser run caught the disabled dispatch button, missing favicon and unreachable mobile studio control. An intermediate full regression run passed 498 tests, with two intentional duplicate tablet skips. The full run passed 504 tests with four intentional project-specific skips: tablet checks run in the desktop project, and mobile drawer checks run in the mobile project. After a final ref-capture lint cleanup, a focused keyboard/navigation run on the final build passed eight tests with two intentional desktop skips.

Browser command used:

```sh
PLAYWRIGHT_PORT=3100 \
PLAYWRIGHT_PRODUCTION=1 \
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH='/Users/dieturetech/Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing' \
pnpm --dir apps/web test:e2e
```

Existing dependencies were available and reused. No dependency installation or manifest/lockfile changes were necessary. Playwright 1.65.0's default browser revision was absent, so the tests explicitly used the existing Chromium 145.0.7632.6 executable. This is Chromium desktop/mobile emulation, not native Safari or physical-device UAT. Port 3000 was already in use and was left alone; Playwright managed the production server on 3100.

The suite covers all 77 page templates with representative valid dynamic IDs in EN/AR, at desktop 1440px and mobile 375px, plus key workflow layout checks at 1024px and 768px. It checks HTTP 200, visible headings, document language/direction, page exceptions and console errors. Main workflow links are followed or requested, with locale and most-specific navigation selection verified. It also tests local connector preparation, canonical draft reload/preflight, blocked and queued job history, Starter quota blocking, media ordering/category/watermark, routing, viewing request/cancellation, source/period filters, clipboard denial, corrupt/unavailable storage and keyboard controls.

Command output logs are saved in [artifacts/phase0/logs](../artifacts/phase0/logs/).

## Screenshots and visual QA

56 actual browser screenshots are saved in [the screenshot directory](../artifacts/phase0/screenshots/): 13 workflow screens × two locales × two device projects, plus four populated job-history captures. The screen set includes dashboard, AI Studio, canonical editor, media, marketplace, provider setup, publishing, empty/populated history, leads, routing, billing, analytics and connector-health admin.

Representative captures:

- [English desktop control tower](../artifacts/phase0/screenshots/chromium-en-dashboard.png)
- [English mobile control tower](../artifacts/phase0/screenshots/mobile-chromium-en-dashboard.png)
- [Arabic desktop marketplace](../artifacts/phase0/screenshots/chromium-ar-marketplace.png)
- [Arabic mobile marketplace](../artifacts/phase0/screenshots/mobile-chromium-ar-marketplace.png)
- [Canonical editor](../artifacts/phase0/screenshots/chromium-en-editor.png)
- [Arabic mobile publishing workbench](../artifacts/phase0/screenshots/mobile-chromium-ar-publishing.png)
- [Populated publishing history](../artifacts/phase0/screenshots/chromium-en-history-with-jobs.png)
- [Channel analytics](../artifacts/phase0/screenshots/chromium-en-analytics.png)

Visual spot checks inspected dashboard, editor, marketplace, publishing, billing, job history and analytics across EN/AR and desktop/mobile. The existing editorial/operational design is preserved. Wide operational tables scroll inside their containers on mobile; they do not expand the document. Arabic document direction and mirrored layout are verified; untranslated English body content remains visible and is not represented as completed localization.

## Remaining limitations and scope decisions

- Full Arabic translation, native-speaker review, independent accessibility/design signoff and cross-browser/physical-device UAT remain pending. Keyboard and layout regression tests do not establish comprehensive WCAG conformance.
- Independent second-tool review of OpenSpec change 0004 remains pending. No independent product scope was authored.
- The kickoff's Task 2 feature backlog was deliberately deferred under the user's Phase 0 instruction: creating new canonical records, shared media persistence, real AI provenance, and expanded loading/error/permission demonstrations were not implemented.
- All external property portals, payment gateways, AI providers, WhatsApp, Meta and Google services remain unconnected. A local queue entry is never remote acceptance. Real backend/tenant authorization, billing, webhooks and partner acknowledgments still require separately approved production work.
- No `.git` metadata was present (`git status --short` returned “not a git repository”), so a Git diff/status could not be generated. No commit, push or deployment was attempted.
