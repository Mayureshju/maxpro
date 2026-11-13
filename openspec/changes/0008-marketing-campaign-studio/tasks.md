# Tasks

- [x] Inspect product contracts, baseline commit, CI and existing tests.
- [x] Author OpenSpec 0008 before feature changes.
- [x] Implement typed campaign model, migration, guards and deterministic AI contract.
- [x] Connect portfolio, guided editor, creative/policy/budget/approval and audit workflows.
- [x] Connect Meta catalogue, Google planning and consent-aware attribution.
- [x] Connect campaign enquiries, deduplication and shared CRM reporting.
- [x] Add guarded command and Playwright coverage; run retained regressions.
- [x] Run install, typecheck, lint, default build, supported fallback if needed.
- [x] Capture/inspect EN/AR screenshots at four widths and run axe checks.
- [x] Update coverage/contracts and docs/20 with actual evidence and limitations.
- [ ] Independent authenticated second-tool review.

Final evidence: frozen install, typecheck and lint passed. Default Turbopack build failed on the recorded sandbox port-binding restriction; supported Webpack production build passed. Full final Playwright: 678 passed / 20 intentional skips, including 50 passing dedicated campaign cases and four automatic new-route checks. Axe: 48 changed main-content states across EN/AR desktop/mobile, zero violations. 80 real browser captures cover ten states at 1440/1024/768/375; eight contact sheets and enlarged representative views inspected. See docs/20-phase4-marketing-campaigns.md and artifacts/phase4/.

Independent review remains pending: Claude Code auth status returned loggedIn:false / authMethod:none. No second-tool review is claimed. Professional Arabic/native-speaker UAT, legal/provider review and all production services remain prerequisites. No commit, push or deployment.
