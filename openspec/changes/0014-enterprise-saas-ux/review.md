# Independent read-only review

One author owned OpenSpec 0014 and implementation. A separate reviewer inspected the authored contract, source diff, cleanup and running production UI without editing source or inventing scope.

Findings corrected:

- Popup anchored to the narrow text input rather than its full control.
- Software-keyboard-sized viewports could clip an open popup when its field moved below the visible area.
- 200% CSS zoom could apply positioning scale twice or place an upward popup above the viewport.
- TextArea did not consume its loading prop consistently.
- Future combobox consumers in native modal dialogs needed their portal inside the top layer.

The final production Chrome recheck found the popup inside the viewport at both 320×300 (x33–217, y8–288) and 200% CSS zoom at 1440×1000 (x468.63–678, y443.11–747.11). Loading and dialog-aware host handling were corrected. No additional concrete defect was found in the reviewed changes; domain engines and persistence schema were unchanged. Full regression, axe and final screenshot acceptance remain recorded by the author in docs/31 and artifacts/phase10.

Author verification after the final source changes: dependency install, typecheck, lint and Webpack production build passed. The closing full browser suite passed 891 tests with 37 expected skips; four full-route axe reports contain 344 checks and zero violations. Default Turbopack's sandbox worker-port failure and interrupted browser runs are recorded in the delivery report. These are author-run gates, separate from the independent review above.

The refreshed final matrix contains 284 EN/AR route/viewport captures, zero document-overflow findings and zero visible native selects below 44px. The screenshot manifest contains 450 baseline/final images. Final narrow inventory and open-overlay screenshots were inspected after the last control-width and border changes.
