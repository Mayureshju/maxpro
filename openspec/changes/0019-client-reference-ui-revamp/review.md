# Independent bounded review

One author owned scope and implementation. A separate read-only reviewer inspected the change against AGENTS.md and OpenSpec 0019, with no edits, new product scope or engine changes.

Findings repaired: assistance drawer geometry/header layout and mobile borders/padding; editor action dock structure and safe-area layout; channel choice alignment/setup spacing; CRM bubble/composer layout; settings rows; public card containment/enquiry padding/mobile positioning; long imported-title wrapping. Canonical sharing now explicitly requests a local preview for both seeded AQ and new UUID properties, without replacing static catalogue examples.

Final reviewer recheck: no remaining blocker in the bounded source diff; selected-organization preview lookup and browser-local/unpublished disclosures are sound. Domain engines and demo-provider logic remain unchanged. `git diff --check` passed. Browser/accessibility/visual verification is owned and recorded separately by the primary agent in docs/36-client-reference-ui-revamp.md.
