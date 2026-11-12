# Tasks

- [x] Audit canonical implementation and product contracts.
- [x] Author proposal, design and acceptance before edits.
- [x] Enrich shared connector capabilities and add mapping/feed pipeline.
- [x] Add command guards, job migration, retry/cancellation and attempt history.
- [x] Complete directory/detail/feed/workbench/history/diagnostics UI.
- [x] Add focused tests and frozen-lockfile CI smoke job.
- [x] Run checks, inspect actual EN/AR screenshots and record evidence.
- [x] Update coverage matrix and Phase 2 report.
- [ ] Independent Claude Code review of this same change.

Second-tool review attempt: Claude Code returned “Not logged in · Please run /login”. See `artifacts/phase2/logs/independent-review.log`. This authentication prerequisite remains open; it does not authorize invented partner capabilities or replace review with a self-review.

Final evidence: frozen network install, typecheck and lint passed. Default Turbopack build failed on the documented host port restriction; the final supported webpack production build passed. Full Playwright: 572 passed / 4 intentional skips, including 32 new Phase 2 cases. Exact CI smoke command: 12 passed. 68 actual EN/AR screenshots include 1440/1024/768/375 pixel layouts and populated workflows. See `docs/18-phase2-connector-hub.md`. No commit, push or deployment.
