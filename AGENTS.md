# MaxPro — canonical instructions for Codex, Claude Code and Cursor

## Product truth
The user-supplied Gemini PRD in `docs/reference/GEMINI_USER_PRD.txt` is **primary** for this version. Build an **agency-first, multi-tenant Real Estate Operating System and Connector Hub**, not a generic public property classifieds dashboard. Start with `docs/00-source-of-truth.md`, `docs/11-gemini-requirements.md`, `docs/12-architecture-contracts.md`, `docs/13-design-acceptance.md`, and `docs/14-delivery-plan.md`.

## V3 prototype reality
- Next.js/TypeScript app in `apps/web`; demo UI only. No backend/AI/real account/portal/Meta/Google/WhatsApp/payment connection.
- `src/lib/gemini-product.ts` owns prototype connector definitions and Gemini plan examples. Do NOT resurrect Portal A/B/C in navigable routes or invent partner capabilities.
- `src/components/gemini/demo-provider.tsx` stores **fictional browser-local** demo state: selected plan, setup booleans, property edits, simulated publishing attempts and assignment rule. Do not store API credentials or personal data there.
- Primary journey: canonical property edit → partner setup → source validation → per-destination local queue → status history → lead CRM → channel ROI. Keep a clear approved-vs-queued-vs-remotely-accepted distinction.
- Old public marketplace routes remain as secondary showcase; do not silently delete them or promote them as primary business purpose.
- Gemini sample commercial tiers: QAR 179 / 725 / 1,800+; listing quotas 3 / 25 / negotiated; portal quotas 1 / 2 / all authorized. Every page must identify them as *illustrative pending approval*.

## SDD change contract
For nontrivial work add `openspec/changes/<id>/{proposal.md,design.md,tasks.md,specs/.../spec.md}`. Include GEM requirement IDs, UI states and non-UI acceptance. One tool authors, one reviews; never let different assistants invent independent product scope.

## UI and accessibility
Preserve the editorial/operational visual system (see `docs/13-design-acceptance.md`). No generic gradient-heavy KPI cards. English and Arabic with real RTL and logical CSS. Do not claim full Arabic coverage; it still needs professional completion. Use tested semantic HTML, keyboard focus and mobile layouts. Never use a placeholder illustration as proof a live Next.js page rendered.

## Production architecture guardrails
Intended: Next.js 16 App Router, NestJS modular monolith, PostgreSQL/PostGIS, Redis/BullMQ, S3, OIDC, outbox, idempotency, tenant isolation, server-side Vault/KMS credentials. No scraping, unofficial headless portals or vendor-specific adapter logic in UI. Only authorized APIs and officially agreed feeds. All commercial publishing, marketing spend and high-risk AI actions need application-enforced approval, audit and tenant authorization. Real statuses derive from partner acknowledgments, never a client click or enqueue.

## Verification before handoff
Run dependency install, `pnpm typecheck`, `pnpm lint`, `pnpm build`, Playwright EN/AR desktop/mobile and visual QA. Add tests for new features. Do not say tests passed if dependencies unavailable or browser not run. Report changes, requirement IDs, test commands/results, missing prerequisites, and any scope conflicts. Do not deploy or push without explicit user authorization.
