# Prototype architecture

- Explicit Next App Router page files under `[locale]` and `[locale]/workspace`.
- Distinct presentation components (`overview`, `inventory`, `studio`, `relationships`, `operations`, `public-pages`), with shared primitives and fixtures.
- Bilingual route prefix through `next-intl` and `dir` at the root; translation remains incomplete and is tracked as a gap.
- No network requests, database, file uploads or payments. All interactive behavior is local React state and labeled as demo.
- Public pages use large-scale typography and property photography; workspace uses dense layouts and restrained UI.
- Future business modules will live behind typed API boundary. Approval and permission checks must live on server, not in the browser.
