# Design

- Existing Next.js app is retained. New cohesive module: `src/components/gemini/*` with shared provider for browser-local demo state, canonical data definitions in `src/lib/gemini-product.ts`.
- Client-side state is intentionally narrow (sample plan, boolean demo preparation, sample property edits, simulated per-destination jobs, lead routing). Never put credentials, customer PII, or real provider access in it.
- Navigational IA: Agency Control Tower → Properties & AI Studio → Publish → Connector Hub → Leads & Inbox → Growth & Analytics → Organization & Admin. The public site is secondary/white-label showcase.
- Pre-flight operates on one canonical property plus browser-local edit overrides, not on a generated description alone. Each destination yields its own missing fields; each demo job stores the reason or local queued status.
- Plan example limits and provider catalogue are centralized. No API schema is asserted to be official. Publishing `queued-demo` can never be displayed as remote acceptance.
- Visual identity: editorial headings, dense readable property/connector tables, side inspectors, clean status treatments, task-specific forms and stepper. No uniform KPI-card surfaces.
- Production architecture remains a future modular monolith, API-first, provider adapter pattern, transactional outbox and signed connector events; see `docs/12-architecture-contracts.md`.
