# Experience design

Editorial ivory/stone, charcoal, eucalyptus, restrained serif display and legible sans-serif body; Arabic uses the existing Arabic/system font stack. The hero leads with the product, not a public listings search. Real screenshots are captured from the baseline production app, including Arabic and human-review assistance states. Assets carry capture provenance. Existing sample photography only; no new third-party imagery.

Server-render the marketing compositions and metadata. Small client islands own preview tabs, tour steps, local contact preview, mobile dialog and header scroll treatment. Native details provide FAQ and navigation disclosures. Keyboard tabs implement roving focus and arrow/Home/End behavior. Mobile navigation uses a modal dialog, Escape, focus restoration and scroll lock.

Different compositions serve different intents: wide product proof, sequential tour, editorial feature ledger, comparison/directory tables, agency day-in-the-life and grouped FAQ. All primary conversion links open the existing demo entry; contextual tour links open labelled fictional workflows.

Scoped `mk-*` CSS follows shared foundations without changing workspace selectors. CSS opacity/transform transitions only, no animation dependency. Reduced motion disables nonessential animation. No reveal may hide content pending JavaScript.

SEO: route-specific localized title/description/canonical/alternates/OG/Twitter; environment-owned origin rather than guessed production hostname. Public sitemap excludes fictional workspace/account/research/detail URLs. Workspace/account pages have noindex. Canonical metadata must never leak the homepage canonical into child routes. Prototype robots disallows indexing until an approved origin is configured.
