# Supplied logo replacement

The shared BrandMark renders `/demo-media/aqarpro-logo.webp` at its original 1356:330 proportions, with responsive sizing and an accessible AqarPro name. It appears in public headers/footers, the workspace sidebar, and registration/sign-in. The footer uses a white backing to keep the supplied dark lettering readable.

- `pnpm install --frozen-lockfile`: passed (dependencies already up to date).
- `pnpm typecheck`: passed.
- `pnpm lint`: passed.
- `pnpm build --webpack`: passed. This uses the previously verified build path for the host's Turbopack restriction.
- Playwright/installed Chrome: 32 EN/AR checks passed across public, sign-in, registration and workspace routes at 1440, 1024, 768 and 375px; image loading, proportions and no horizontal overflow verified. No browser exceptions.
- Actual EN/AR desktop/mobile screenshots captured here and representative header/footer/sidebar images visually inspected.

UI traceability: GEM-03 (RTL presentation), GEM-17 (brand presentation), GEM-22 (responsive layout). This bounded asset replacement adds no application workflow or provider capability.
