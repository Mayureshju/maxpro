# Acceptance specification

## Shared design (GEM-03/22)
All active agency pages consume common tokens and control styles. Standard controls measure at least 44px, compact table controls are justified, focus is visible, and logical properties support RTL. EN/AR are checked at 1440/1280/1024/768/375/320. Headers, editor dock and modal/drawer surfaces must not obscure keyboard focus. Reduced motion and 200% zoom are checked. No viewport overflow; wide data remains inside named scroll regions.

## Selection (GEM-01/02/04/13/14/18)
Short lists use NativeSelect; binary purpose uses radios; long property/agency/agent lists use search. Test closed/open, keyboard, selected, disabled, empty, query, clear, no-results, long labels and scrolled options. Search does not mutate the selected value. Escape, Tab and outside dismissal discard search. Enter/click explicitly selects canonical values. Disabled items cannot be committed. Selection remains correct after save/reload and organization changes. Channel multiple choice uses checkboxes and an explicit count.

## Core workflows (GEM-02–08/10–16/21/24)
Preserve incomplete draft saving, revisions, media ordering, dirty navigation protection, property links, per-channel blockers and setup, ordered campaign approvals and local status histories. Approved, queued and provider accepted remain distinct. AI suggestions are deterministic, source-grounded, editable, accepted/dismissed explicitly and invalidated on source changes. Preserve assignment, consent, conversations, viewings, billing previews and organization-scoped local operations. Empty/error/loading states provide recovery and never imply external delivery.

## Cleanup and regression (GEM-09/17–20/23)
Classify findings ACTIVE, COMPATIBILITY, TEST SUPPORT, DOCUMENTED, DEAD or UNCERTAIN using route/import graphs plus reference searches. Remove only verified DEAD code. Preserve public/advanced routes, tests, schema and engines; document removed files, selectors, consolidations and uncertain findings. Run all existing tests and focused new UI tests, typecheck, lint and production build. Report actual counts and prerequisites. Browser screenshots and axe are evidence, not accessibility certification. No commit/push/deploy or external service implementation.
