# Tasks

- [x] Read product truth, architecture, design acceptance, Phase 0 evidence and source workflows.
- [x] Write this proposal, design and acceptance contract before implementation.
- [x] Install locked dependencies and locally verify Phase 0 baseline.
- [x] Implement canonical schema, seed/migration, validated persistence and missing-ID states.
- [x] Connect create, inventory, editor, detail/revisions, media and Studio human review.
- [x] Connect canonical preflight, plan quota guards, per-revision publication references and persistent attempts.
- [x] Add lifecycle, corruption, quota, bilingual/responsive and keyboard regressions.
- [x] Run typecheck, lint, build and full Playwright suite; capture and inspect actual screenshots.
- [x] Document changed files, GEM coverage, test results, limits and next milestone.
- [ ] Independent second-tool review of this same contract (external prerequisite).

Independent review attempt: the installed Claude Code CLI was invoked in restricted read-only mode and returned “Not logged in · Please run /login”. No review was completed; see artifacts/phase1/logs/independent-review.log. This is an authentication prerequisite, not product approval or a permission rejection.

Final evidence: pnpm install, typecheck and lint passed; default Turbopack build encountered the documented host port restriction, supported webpack production build passed; final Playwright run passed 540 tests with 4 intentional skips, including 32 new lifecycle cases. 62 lifecycle and 56 regression screenshots were captured from the running app; representative EN/AR desktop/tablet/mobile screenshots were inspected. See docs/17-phase1-canonical-property-lifecycle.md and artifacts/phase1/logs/e2e-final.log. No commit, push or deployment.
