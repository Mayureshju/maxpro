# Frontend acceptance

- GEM-01/18/19/20: organization/persona controls keep existing behavior and accessibility; plans are illustrative pending approval; all operational counts remain scoped and browser-local.
- GEM-02/03/04/22: inventory searches EN/AR fields and combines status, purpose, type and price filters with sorting and both views. No-match reset recovers records. IDs/source values remain unchanged. Empty organizations can create a canonical draft.
- GEM-02/05/08/21: dirty editor changes warn on reload and anchor navigation. Stay preserves edits; discard navigates; successful save clears the warning, failed save does not. Dialog supports keyboard, Escape and focus restoration. Existing revision invalidation and approval semantics remain.
- GEM-06/07/08/13–16/24: dashboard values link to canonical next tasks, jobs, CRM, viewings and campaigns. No invented growth, partner acceptance or spend. Empty schedule/campaign/lead states provide meaningful next actions.
- GEM-03/17/22: public and operational screens preserve language and direction, keyboard controls, responsive tables and truthful simulation disclosures. Route loading, error, empty, success and validation states remain identifiable.
- Non-UI: no backend/API/payment/provider connection, secrets or personal data storage; no architecture rewrite, new animation library, deleted routes, commits, pushes or deployment.
- Verify dependency installation, typecheck, lint, default build (separately report Webpack fallback if needed), full e2e, new behavioral tests, every active route EN/AR at 1440/1024/768/375, actual screenshot review and remaining Arabic/stakeholder decisions.
