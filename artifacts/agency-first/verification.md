# Agency-first acceptance — 14 November 2026

Final production browser run: **843 passed, 35 expected skips, 0 failures**, across 878 scheduled cases, in 4.8 minutes. Both Chromium desktop (1440px) and Chromium mobile emulation (375px) ran English and Arabic journeys. Additional screenshot/viewport checks covered 1024px and 768px. Skips cover project-specific or duplicate-width captures and the separate desktop drag/mobile keyboard paths.

| Check | Command | Result |
| --- | --- | --- |
| Dependencies | `pnpm install --frozen-lockfile` | Passed; locked dependencies already up to date |
| TypeScript | `pnpm typecheck` | Passed, including after restoring the original next-env.d.ts change |
| ESLint | `pnpm lint` | Passed without warnings |
| Default build | `pnpm build` | Host restriction: Turbopack CSS worker could not bind a local port, including the escalated retry |
| Production build | `pnpm build --webpack` | Passed; supported Next.js webpack output, 151 static pages plus dynamic routes |
| Full Playwright | Command below | 843 passed / 35 skipped / 0 failed |
| Visual QA | Actual Next.js captures | 5 before and 73 after captures; EN/AR 1440/1024/768/375 matrix and interactive states |
| Independent review | OpenSpec 0012 review.md | All reported findings corrected and rechecked |
| Diff hygiene | `git diff --check` | Passed |

```sh
PLAYWRIGHT_PORT=3100 PLAYWRIGHT_PRODUCTION=1 \
MAXPRO_EVIDENCE_ROOT=artifacts/agency-first/regression \
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
pnpm --dir apps/web exec playwright test --workers=4
```

The installed Chrome executable was used because this Playwright version's bundled browser was absent. The production QA server was shut down by the test runner; the pre-existing developer server was preserved.

## Evidence

- [Final full browser log](playwright-acceptance.log)
- [Typecheck](typecheck.log), [lint](lint.log), [production build](build.log)
- [Screenshot dimensions and hashes](screenshots.json)
- [Desktop dashboard](after/en-1440-dashboard.png), [Arabic mobile publishing](after/ar-375-publishing.png)
- [Reviewed AI proposal](after/mobile-chromium-ar-ai-review.png), [portal result](after/mobile-chromium-en-portal-result.png), [advertising result](after/chromium-en-ad-result.png)
- `regression/logs/axe-*.json` and nested phase logs contain accessibility evidence; active-page WCAG A/AA assertions passed.
- [Independent review and corrections](../../openspec/changes/0012-agency-first-ux/review.md)

Representative before/after dashboard, property, editor, registration, RTL/mobile, AI-review and channel-result images were visually inspected. Automated checks covered the complete requested width matrix. Earlier diagnostic runs and their corrected failures remain in playwright-full.log, playwright-focused.log and playwright-final.log; playwright-acceptance.log is the final acceptance result.

## Requirements and limits

Primary UX coverage: GEM-01–08, GEM-10–16, GEM-18/19, GEM-21/22/24. Existing showcase, feeds, quotas, canonical IDs, tenant slices, revision conflicts and approval guards were preserved. The registration redirect follows Phase A's direct-dashboard requirement. No product-scope or backend-architecture conflict remains.

Professional Arabic review, Arabic source-note parsing, physical-device/Safari/Firefox UAT and all production services remain future work. Prototype suggestions are deterministic and reviewed; file uploads retain metadata only. No real sign-in, AI inference, provider connection, ad spend, messaging, payment, backend or Frappe service was implemented.

No deployment, commit or push was performed. The user's pre-existing next-env.d.ts dev-type imports were restored exactly; unrelated historical screenshot files were preserved.
