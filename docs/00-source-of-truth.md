# MaxPro v3 — source precedence and conflict decisions

**Effective 2026-11-12. The user-supplied Gemini PRD is the primary product reference for this v3 development branch.** Its exact text is in `docs/reference/GEMINI_USER_PRD.txt`. This is a design/development decision, not business/contract approval of pricing, legal rules or partner access.

## Priority
The explicit Phase 5 Frappe architecture decision supersedes backend implementation examples in all earlier documents; Gemini remains primary for product requirements.

1. **Gemini PRD**: "All-in-One Real Estate Operating System & Connector Hub / Shopify for Real Estate Brokers & Landlords." Canonical listing, connector syndication, CRM, subscription limits, tenant accounts, billing, analytics, bilingual AI, WhatsApp.
2. User's instruction: **entire navigable prototype, not generic AI-generated dashboards**, initially implemented with Codex, interoperable with Claude Code and Cursor.
3. Live AqarPro/MaxPro reference `maxpro-one.vercel.app/en`: behavioral/visual reference only, can contain mocked integration status. Do not use as a fact source for official provider capabilities.
4. Earlier confidential MaxPro MPT-PRJ-REQ-003 (2026-10-21): retains relevant privacy/security and design rules; public classified marketplace and ERP expansion are **separate backlog tracks** unless an approved scope decision reintroduces them.

## Approved for prototype direction only
- Agency/B2B SaaS is primary; public property pages become *optional showcase/white-label landing pages*, not the central application.
- Master property record -> source/bilingual review -> partner-specific preflight -> authorized connector -> separate destination jobs/status -> lead CRM -> attribution/ROI.
- Connector catalogue shows proposed integrations (Property Finder, Qatar Living, Bayut/Dubizzle, Meta catalogue, Google Ads, GA4, WhatsApp, AI), **not connected services**.
- Subscription sample starts from Gemini's **QAR 179 / 725 / 1,800+** monthly illustrations; 3/25/negotiated listing quotas and 1/2/all-authorized portal quotas; subject to written pricing sign-off.
- **2026-11-13 Phase 5 architecture decision:** Next.js 16 frontend and a future custom Frappe Framework application; Frappe-managed database/authentication/roles, Python business methods and Frappe jobs/workers. Supersedes the earlier NestJS proposal and backend examples in the preserved Gemini PRD. No backend is implemented. See `22-frappe-backend-blueprint.md`.

## Pending decisions, not silently resolved
- Final approved legal entity and product brand (`MaxPro` versus `AqarPro`) and source logo.
- Whether the older public-search marketplace/agent modules must launch in parallel with this SaaS; do not delete them from the codebase without written scope approval.
- Which real estate portals have contractual feed/API rights for this organization and specific country; do **not** use scraping or unapproved headless automation.
- Actual Meta catalogue housing eligibility, Google Ads/PMax feed capabilities, regulated advertising and mandatory licensing by geography.
- Production payment provider(s), VAT/tax and invoice rules, billing discounts, data residency and security approvals.
- Timelines: Gemini's 12-week fast-track is an optimistic target contingent on provider approvals, team staffing and successful UAT—not a committed completion date.

## Evidence policy
The UI is a prototype with fictional example properties, provider cards and local state; *no* successful external publishing, login, AI, payment, webhook delivery or analytics collection has occurred. Real integration requests must not be represented as passing until production evidence exists.
