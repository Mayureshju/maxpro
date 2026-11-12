# First Codex task in Gemini-aligned v3

You are working in `maxpro-gemini-aligned-v3`, a UI prototype whose **primary source** is `docs/reference/GEMINI_USER_PRD.txt`. Read `AGENTS.md`, `docs/00-source-of-truth.md`, `docs/11-gemini-requirements.md`, `docs/13-design-acceptance.md`, and the OpenSpec change 0003 before editing.

## Task 1 — verify and repair the actual runnable prototype
1. Run `pnpm install`, `pnpm typecheck`, `pnpm lint`, `pnpm build`. Fix errors without altering Gemini product semantics. Commit the generated lockfile if the project owner requests a commit; otherwise leave uncommitted.
2. Run Playwright Chrome smoke tests, including the new GEM path. Generate **real running-browser screenshots** at desktop, mobile (375px), and Arabic `/ar` for: Agency Control Tower, canonical editor, Connector Marketplace, provider setup, publishing workbench, job history, lead routing, subscription and channel analytics.
3. Fix browser runtime errors, dead links, logical RTL/overflow, missing form labels and keyboard states. Use high-fidelity editorial/operational layout; don't generate a new generic dashboard design.
4. Verify that changing a canonical draft influences pre-flight status, setup bools affect destination readiness, plan quota blocks excess destinations, and no button claims real external publishing.
5. Verify all new routes plus legacy critical routes return expected page headings and navigation correctly highlights the most specific route.
6. Review that all copy containing "connected", "live", "succeeded", "authorized" cannot be mistaken for real integration. External providers and official partner permissions remain unverified.

## Task 2 — close P0 prototype quality gaps in a separate OpenSpec change
- Full listing creation workflow should persist a new browser-local canonical property (currently only edits seeded records). Introduce a shared typed provider if appropriate.
- Add source provenance and an explicit fact-review history for AI Studio; keep simulated AI separate from a real model call.
- Synchronize room media categories/ordering with the publishing pre-flight data model; currently media previews are local to the media page.
- Make all critical UI error/loading/empty/permission states demonstrable without backend connections.
- Finish Arabic localization of the new Gemini screens and the old v2 body copy; obtain human translation review.
- Deepen role/organization selection and intro/onboarding to the agency OS, without pretending RBAC exists.

## Response contract
Report actual build/test results, file changes, requirement IDs, screenshots and blocked provider integrations. Do not silently install new libraries, deploy, commit or push. Do not implement real partner adapters unless authorized official documentation and credentials are provided and scoped in a separate approved change.
