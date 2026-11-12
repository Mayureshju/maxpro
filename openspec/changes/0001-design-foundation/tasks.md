# Tasks — 0001 design foundation

## 1. Initial skeleton
- [x] 1.1 Add Next.js 16 App Router project files, Tailwind 4 dependencies and locale routing source.
- [x] 1.2 Add provisional design tokens and public/agency shells.
- [x] 1.3 Add English and Arabic message dictionaries and directional layout.
- [x] 1.4 Add dashboard, Studio, Hub, Leads and pricing **demo** screens.
- [x] 1.5 Add portable agent instructions and architecture/scope docs.

## 2. Build validation (requires local dependency install)
- [ ] 2.1 Run `pnpm install` and commit generated lockfile after permission.
- [ ] 2.2 Run `pnpm typecheck`, `pnpm lint`, `pnpm build`; fix real errors.
- [ ] 2.3 Inspect 320/375/768/1440px public and workspace routes in browser.
- [ ] 2.4 Validate `/en` / `/ar` copy, `html[dir]` and URL/query preservation on locale switch.

## 3. Accessibility / component quality
- [ ] 3.1 Refactor shared CTA/card/badge primitives using shadcn RTL-ready conventions.
- [ ] 3.2 Add skip navigation link, focus traps where required, appropriate ARIA labels.
- [ ] 3.3 Fix workspace text sizes and contrast for real-world AA readability.
- [ ] 3.4 Create keyboard/mobile/RTL Playwright smoke tests and screenshot baselines.

## 4. Approval gate
- [ ] 4.1 Confirm MaxPro vs AqarPro brand and actual logo from sponsor (D-07).
- [ ] 4.2 Reconcile live AQP-REQ-001 against older MaxPro brief and record approved changes.
- [ ] 4.3 Obtain written design/UX approval before starting backend business integrations.
