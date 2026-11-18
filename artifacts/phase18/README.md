# Connected CRM milestone evidence

Baseline: `6db0bfbd73660025768a01a6380bb4753ac60ee8`, verified against remote main. Final production build ID: `joMi3OmJWDXxWStk35kYG`. Actual local Chromium screenshots only; no generated interface illustrations. No commit, push or deployment.

Read [the product audit and all scenario/prerequisite details](../../docs/39-connected-crm-productivity.md), [OpenSpec](../../openspec/changes/0022-connected-crm-productivity/proposal.md) and [independent review](../../openspec/changes/0022-connected-crm-productivity/review.md). [Exact changed files](changed-files.json) and [screenshot hashes](screenshot-manifest.json) are machine-readable inventories.

## Before and after

| Surface | Original commit | Final implementation |
|---|---|---|
| English desktop homepage | [Before](before/en-1440-home.png) | [After](after/en-1440-home.png) |
| Arabic phone homepage | [Before](before/ar-375-home.png) | [After](after/ar-375-home.png) |
| English desktop CRM, same 25-property fixture | [Before](before/en-1440-crm-fixture.png) | [After](after/en-1440-crm-fixture.png) |
| Arabic phone CRM, same fixture | [Before](before/ar-375-crm-fixture.png) | [After](after/ar-375-crm-fixture.png) |
| Lead detail, same fixture | [Before](before/en-1440-lead-fixture.png) | [After](after/en-1440-lead-fixture.png) |
| New follow-up form | No dated task entity existed | [English desktop](after/en-1440-follow-up-form.png), [Arabic 320px](after/ar-320-follow-up-form.png) |
| New reviewed qualification | No structured requirement proposal existed | [English](after/en-375-qualification-proposal.png), [Arabic](after/ar-375-qualification-proposal.png) |
| Confirmed property matches | No saved-property matching existed | [English](after/en-1440-property-matches.png), [Arabic](after/ar-375-property-matches.png) |
| Contextual enquiry summary | Existing assistant had enquiry navigation | [English](after/en-375-lead-summary.png), [Arabic](after/ar-375-lead-summary.png) |

Primary evidence: **132 before** (108 original default-state captures + 24 original-commit fixture captures); **528 after** (408 route/state captures + 120 fixture/interaction captures), **660 PNGs** total. The after matrix covers EN/AR at 320, 375, 768, 1024, 1280 and 1440. Reports show zero page errors, HTTP failures or document overflow. Tables/pipelines may scroll inside named regions; this is distinct from unwanted page overflow.

All twelve layout contact sheets were inspected, with full-resolution checks of home, CRM, follow-up forms, proposals and matching results. Contact sheets are crops/resizing of actual screenshots, not synthesized screens: [EN 320](sheets/en-320.jpg), [375](sheets/en-375.jpg), [768](sheets/en-768.jpg), [1024](sheets/en-1024.jpg), [1280](sheets/en-1280.jpg), [1440](sheets/en-1440.jpg); [AR 320](sheets/ar-320.jpg), [375](sheets/ar-375.jpg), [768](sheets/ar-768.jpg), [1024](sheets/ar-1024.jpg), [1280](sheets/ar-1280.jpg), [1440](sheets/ar-1440.jpg). Full-page interaction captures reset scroll before capture; open dialogs use viewport captures to keep fixed UI readable.

## Measurement and accessibility records

- [Baseline route audit](before/audit.json); [final route audit](after/audit.json).
- [Baseline same-fixture measurements](before/crm-audit.json); [final same-fixture measurements](after/crm-audit.json); [frozen fictional fixture](fixture.json). Both reports record the same fixture SHA256.
- Six measured paths preserve existing counts except property → campaign preparation → linked enquiries, reduced **3 → 2 activations**. Creating a property remains 2 activations + 3 text entries; preparing a campaign draft 2; enquiry → reviewed reply draft 4; unassigned filter 1; finding a property among 25 records 1 search + 1 activation. Initial route load, reading and scrolling are excluded. Browser Back counts as an activation in the original cross-module path. These are scripted evaluator measurements, not human usability research.
- [96 new whole-document WCAG A/AA scans](accessibility/results.json): zero violations at all six EN/AR widths, including CRM table/board, follow-up form, requirement proposal/form, matches and lead summary; keyboard wrap, Escape and return focus also checked. [Execution result](accessibility.log). Native-speaker, physical-device and assistive-technology review remain pending.

## Commands and results

| Command/check | Actual result |
|---|---|
| `CI=true pnpm install --frozen-lockfile` | Passed with network-enabled execution; lockfile up to date, already installed. The first restricted network attempt was not counted as a successful install. Tool output is retained in the conversation. |
| `pnpm typecheck` | Passed. [Log](typecheck.log). |
| `pnpm lint` | Passed. [Log](lint.log). |
| `pnpm build` | Failed at known Turbopack/PostCSS worker-port sandbox restriction, `Operation not permitted`. [Actual log](build-default.log). |
| `pnpm --dir apps/web build --webpack` | Passed on final source. [Log](build-webpack.log). |
| `pnpm --dir apps/web test:e2e --timeout=60000 --trace=off` | **1,143 passed, 45 expected skips, zero failures, 1,188 total, 4.7 minutes.** Both Chromium projects ran against restarted frozen final production output. [Log](playwright-acceptance.log). 44 existing skips plus one duplicate mobile fixture-export skip; no new functional test was skipped. |
| `node scripts/connected-crm-accessibility.cjs` | 96 scans, zero violations; modal keyboard checks passed. [Log](accessibility.log). |
| `node scripts/milestone-public-evidence.cjs after` | 408 actual captures, zero page/HTTP/overflow findings. [Log](visual-final.log). |
| `node scripts/connected-crm-evidence.cjs before/after` | 24 original-commit + 120 final captures; six controlled measurements each; zero page/overflow findings. [Before](baseline-measurements.log), [after](final-measurements.log). |
| Independent source review / `git diff --check` | No remaining blockers; whitespace check passed. |

New regression tests exercise legacy hydration/recovery, confirmed requirement persistence, stale/foreign/invalid commands, Qatar task boundaries/rescheduling/completion, candidate evidence/conflicts, rent/year/sale matching, read-only scoped assistance, both-language mobile interactions, shared board stages, organization switch, cross-tab stale proposals/tasks and property-cohort query links. Existing suites continue to cover public CTAs/assistant separation, consent/STOP, draft retention, campaign approvals, quotas, first use, views and analytics.

Earlier runs retain their real failures: [initial focused CRM run](connected-crm-initial.log) included a mistaken fixture count assertion, corrected by deriving the actual cohort; [interrupted broader run](playwright-initial.log) exposed intent shadowing, corrected in the implementation without weakening its existing assertion. The initial accessibility run exposed focus escaping native proposal Tab wrap; the shared modal now enforces wrap explicitly. These runs are not final acceptance evidence. Historical output paths hardcoded in existing tests were copied under [this milestone](historical-evidence-recovery.json), then restored to their baseline bytes so old milestone evidence was preserved.

## Reproduction

Serve the webpack build on port 3022. Use installed Chromium via `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` and run:

```sh
PLAYWRIGHT_PRODUCTION=1 PLAYWRIGHT_PORT=3022 MAXPRO_EVIDENCE_ROOT=artifacts/phase18/regression pnpm --dir apps/web test:e2e --timeout=60000 --trace=off
MAXPRO_CRM_BASE_URL=http://localhost:3022 node scripts/connected-crm-evidence.cjs after
MAXPRO_CRM_BASE_URL=http://localhost:3022 node scripts/connected-crm-accessibility.cjs
MAXPRO_UX_BASE_URL=http://localhost:3022 node scripts/milestone-public-evidence.cjs after
```

For original-commit measurement, extract `git archive 6db0bfb` into a separate temporary directory, install/link the same locked dependencies, serve that checkout on port 3023 and run `MAXPRO_CRM_BASE_URL=http://localhost:3023 node scripts/connected-crm-evidence.cjs before`. This never resets the working checkout. `MAXPRO_CRM_FIXTURE` may explicitly select the frozen fixture. No model, provider, secure login, task notification or production tenant isolation is connected.
