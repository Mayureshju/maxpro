# Codex-first SDD delivery plan — Gemini canonical scope

This is the order for a **full design prototype first, then production**, not a promise of 12-week delivery.

| Milestone | Requirement focus | Demo exit criteria | Production dependencies |
|---|---|---|---|
| M0 — baseline | GEM-01, 02, 03, 19 | Brand/source-of-truth, main navigation, plan examples, overview and editor consistent | Product owner signs priorities / brand |
| M1 — core transaction prototype | GEM-02, 04, 05, 06, 07, 08, 09 | Edit master listing → validate → select connectors → local dispatch ledger; errors shown | Official partner schema/rights for real integration |
| M2 — pipeline and marketing prototype | GEM-10–16, 24 | Lead source, routing, inbox, bookings, Meta/Google/GA4 mock setup and channel ROI | Webhook contracts, consent, provider verification |
| M3 — organization/admin prototype | GEM-17–20 | Agency branding/domains, plans and quotas, connector health, user/admin navigation | OIDC, tenancy, payment and DNS choices |
| M4 — full UI quality | GEM-03, 22, accessibility | Real screenshots, responsive behavior, full RTL, keyboard and empty/error/loading flows, sign-off | Translations, licensed content, design reviewer |
| M5 — production base | GEM-01–09, 17–20, 23 | OIDC, API, multi-tenant Postgres, object storage, outbox, jobs, plan enforcement, audit | Hosting/security reviews |
| M6 — authorized integrations | GEM-07–16, 21, 24 | Pilot publisher and inbound lead end-to-end with real partner acknowledgments, AI quality evaluated | Partner approval, legal/privacy, provider credentials, budgets |
| M7 — production launch | All signed Must scope | Acceptance UAT, penetration test, performance, backups/restore, monitoring, admin guides | Owner approval; rollback strategy |

## Definition of Done for each change
- Every change cites GEM IDs, primary persona, observed state and acceptance evidence.
- OpenSpec `proposal.md`, `spec.md`, `design.md`, `tasks.md` for anything more than trivial fix; no parallel conflicting spec system.
- Desktop/mobile plus Arabic/English UI reviewed; code lint/typecheck/build/e2e run with actual logs.
- Any external API side effect requires server authorization, explicit consent, human approval where applicable and audit.
- If integrations are unavailable, use typed mocks and make mock status **unmistakable**.

## Tool division without fragmentation
- **Codex:** implement bounded change against OpenSpec acceptance; run checks and generate screenshots.
- **Claude Code:** review architecture/security/integration state machine or refactor behind the same contracts.
- **Cursor:** adjust UI against reviewed screenshots while preserving semantics and shared tokens.
- **Single repository and instructions:** `AGENTS.md` is canonical; `CLAUDE.md`, `.cursor/rules/maxpro.mdc` point back to it. No independent rule sets or untracked feature invention.

## Decisions before a real pilot
(1) Approved portal partners with regional coverage and commercial terms; (2) initial GCC country scope and real estate licensing requirements; (3) WhatsApp Cloud API/BSP; (4) Meta/Google account authorization and housing compliance; (5) payment provider/3DS/tax; (6) official entity/product brand; (7) data residency and AI provider; (8) whether public classifieds remains in scope and at what phase.
