# Design: UI foundation

- Next 16.4.6 App Router, locale segment with next-intl `proxy.ts` and server request config.
- One token source (`src/app/globals.css`), distinct public header and agency workspace shell.
- Direction-aware layouts with CSS logical properties, responsive breakpoints 1160, 850, 610px.
- Server-rendered route pages and Client Components only for nav/mobile actions.
- Demo fixtures in `src/lib/demo-data.ts`; no simulated successful external operations.
- Future UI primitives via shadcn/ui, RTL-ready `components.json`; do not mass-install dozens before design review.
- Later API split through versioned OpenAPI: React never directly owns payment/portal/AI business invariants.

## Tradeoffs
Large single global CSS is acceptable as a **starter/reference** only; refactor to modular tokens/component styles or Tailwind utilities as the component library is extracted. Typography uses system stack until licensed fonts and brand assets arrive. Mock dashboard should not misrepresent production metrics.
