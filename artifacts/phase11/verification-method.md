# Verification method

- Dependency restore: `CI=true pnpm install --frozen-lockfile`, successful with approved registry access. Initial sandbox registry resolution and offline-cache attempts were insufficient. Lockfile unchanged. Existing policy skips optional @parcel/watcher/@swc/core scripts.
- Static checks: `pnpm typecheck`, `pnpm lint` (logs alongside this file).
- Requested default `pnpm build`: actual sandbox Turbopack/PostCSS worker-port failure retained in build-default.log. Supported `pnpm --dir apps/web build --webpack` generates the tested production build.
- Owned production server: `pnpm --dir apps/web exec next start --hostname 127.0.0.1 --port 3211`. Existing user development server on the default port is not stopped.
- Full browser run: `PLAYWRIGHT_PORT=3211 PLAYWRIGHT_PRODUCTION=1 PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=<installed Chromium 145 headless shell> MAXPRO_EVIDENCE_ROOT=artifacts/phase11/regression caffeinate -i -s pnpm --dir apps/web test:e2e --timeout=60000 --trace=off`. Retained screenshots, browser-error assertions, source assertions and axe. HTML reports/test-results remain generated ignored files.
- New marketing tests: EN/AR × desktop/mobile, plus sitemap/robots; 42 tests. Stability tests discover 28 additional locale/project route cases for seven new templates. All existing tests retained; public FAQ/pricing selectors follow the redesigned UI, and old capture paths honor the evidence-root environment variable.
- Screenshots: `MARKETING_BASE_URL=http://127.0.0.1:3211 node scripts/marketing-evidence.cjs after` with the browser executable above; 312 captures across 26 templates, EN/AR and six widths. Product capture modes generate genuine desktop/mobile screenshots. Contact sheets are derived from originals without replacing them.
- Browser lab: `scripts/marketing-performance.cjs`, isolated cold browser contexts, production localhost, three samples per language/device profile; desktop unthrottled, mobile 4× CPU / 150 ms RTT / 1.6 Mbps down. Raw LCP/CLS/long-task/event/resource entries retained. Not field metrics, a Lighthouse score or proof of production INP.

Initial failures remain in the initial/focused logs; final results are reported in docs/32 after completion. No deployment, commit, push, domain-engine/state-schema changes or external product service was introduced.
