# Independent read-only review

Reviewer: `marketing_review`, separately delegated under AGENTS.md's author/reviewer requirement. Root authored the change and retained product-scope ownership.

Initial findings:
1. P2: guided preparation step used an empty campaign screen while linking to publishing.
2. P3: obsolete public marketing/account/contact branches and the unused router remained in the legacy client module.
3. Performance concern: Next image priority could preload a desktop screenshot despite the mobile picture source.

Repairs reviewed: tour uses the selected property's real portal-preparation capture and matching link; advertising capture shows the selected property's actual preparation. The image now uses fetch priority/eager loading without a desktop-specific preload. Legacy branches/unused exports are removed. The native mobile dialog explicitly cycles Tab/Shift+Tab and preserves Escape/focus restoration. Muted label contrast and full-opacity text entrance were repaired after browser checks.

Re-review conclusion: no remaining blocking defect in the reviewed changes. Canonical domain engines and workspace workflows are unchanged. The focused recheck records 42 passed, including full-document/expanded-control accessibility. Arabic editorial approval, physical-device review and production field-performance validation remain documented limitations. Final full-suite/matrix and lab checks are owned by root and reported separately in docs/32.

Final author verification: the complete production run passed 961 tests with 37 expected skips and zero failures; full-route axe recorded 372 checks without violations, marketing checks recorded 60 without violations, and the six-width EN/AR matrix recorded 312 captures with no document overflow. A later transient caption-opacity defect caught by the broad suite was repaired with transform-only transitions before this final run. Twelve browser lab samples and explicit field-performance limitations are in docs/32.
