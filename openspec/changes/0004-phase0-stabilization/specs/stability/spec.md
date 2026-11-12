# Stability acceptance

- GEM-02/03: Seeded canonical editor renders; stored drafts survive reload and influence preflight. Hydration does not erase saved edits or cause browser errors.
- GEM-04: Media preview, classification and ordering render and work locally.
- GEM-05–09/18: Marketplace filters, provider preparation, publishing validation/approval, quota blockers, local queued/blocked jobs and feed previews remain available. Queued never means remotely accepted.
- GEM-12–20/24: Measurement, leads, routing, viewing requests, analytics, billing and admin screens render without runtime exceptions. External services remain explicitly simulated/unconnected.
- GEM-03/22: Main navigation works with correct locale, most-specific active route and mobile controls. Key EN/AR workflows fit 1440/1024/768/375px with RTL document direction on Arabic routes. Full Arabic translation remains a documented prerequisite.
- Non-UI: root `pnpm typecheck`, `pnpm lint`, `pnpm build` succeed. Playwright asserts headings, HTTP status, absence of page/console errors and expected workflow state transitions. Malformed browser-local state must not crash core screens. Screenshots come from the running application.
