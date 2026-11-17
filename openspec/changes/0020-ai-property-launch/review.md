# Independent read-only review

A separate reviewer inspected current engines before implementation and reviewed the OpenSpec and final source without editing or defining independent scope.

- Preserved canonical saveProperty expected revision, organization/role guard, source review invalidation and dependent campaign/organization review invalidation.
- Copilot snapshots source organization/property/revision, remounts with organization/path, filters scoped records and uses navigation anchors so UnsavedChanges still intercepts dirty forms.
- Launch renders existing per-channel setup/readiness/quota/approval/history commands; no remote acceptance, credentials, spending or second publishing implementation.
- Found and fixed Arabic unanswered-enquiries routing: the bare reply keyword previously matched first. Explicit expected-intent assertions now cover all eight EN and AR task labels.
- Clarified that the eight numbered launch stages are an overview; readiness, approval and outcomes remain in state-derived panels. Corrected a test title that claimed campaign coverage without creating a campaign.
- Final reviewer conclusion: no blocking correctness, tenant-scope, permission, source-revision or unsaved-state findings remain. Verified focused recheck: 24 passed. Final rebuilt width/accessibility and full regression results are recorded separately.

Browser QA subsequently found one 320px breadcrumb target-size violation introduced by pressure from the new global entry. Mobile now shows the current breadcrumb only, keeping the existing menu/notification controls. Final visual and accessibility verification must use the rebuilt CSS.

An additional adversarial browser check reproduced a nested-dialog cleanup defect: a second tab changed agency, both dialogs unmounted, but body overflow remained hidden. The shared owner-based scroll lock now restores the original overflow only after all dialog owners exit. The independent reviewer confirmed idempotent release and cleanup-order correctness; EN/AR desktop/mobile regression covers two dialogs → cross-tab agency switch → zero dialogs and restored overflow. No blocking finding remains; final rebuilt tests are the gate.
