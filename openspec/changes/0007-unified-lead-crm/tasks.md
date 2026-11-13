# Tasks

- [x] Inspect Phase 0–2 architecture, primary PRD and baseline CI.
- [x] Author proposal, design and acceptance before feature implementation.
- [x] Add canonical CRM entities, normalization, routing, validation/migration and shared commands.
- [x] Integrate intake, filters, table/pipeline/detail, inbox, routing and viewings.
- [x] Derive channel/property reporting and control-tower metrics from shared records.
- [x] Add and run meaningful Phase 3 and preserved regression coverage.
- [x] Capture and inspect running EN/AR screenshots at all four widths.
- [x] Update requirements matrix and Phase 3 report with actual evidence and limitations.
- [ ] Independent second-tool review of this same change.

Final evidence: frozen install, typecheck and lint passed. Default Turbopack build failed on the sandbox process/port restriction; supported Webpack production build passed. Full final Playwright: 624 passed / 12 intentional skips, including 52 passing Phase 3 cases. All retained publishing/feed regressions pass. Axe: 28 touched main-content screen states across EN/AR desktop/mobile, zero reported violations. 64 actual browser screenshots cover eight workspaces at 1440/1024/768/375; contact sheets and enlarged representative captures reviewed. The property Enquiries tab also uses shared leads and opens property-specific intake. See docs/19-phase3-lead-crm.md and artifacts/phase3/.

Independent review prerequisite: the read-only Claude Code attempt returned expired authentication and requires login/configured unattended authentication. See artifacts/phase3/logs/independent-review.log. No independent review is claimed. Professional Arabic completion/native-speaker UAT and all production services remain outstanding. No commit, push or deployment.
