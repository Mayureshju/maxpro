# Audit and design

Baseline: remote main d7a91222a97a7213d04da105066b842d703e4166 (verified with git ls-remote). Existing generated next-env.d.ts change is user-owned.

Reuse demo-provider commands, canonical-property/media storage, syndication-engine approval contexts/readiness/quotas, campaign-engine revision-bound approvals, lead-crm, reporting and the bilingual primitives. No second operational store.

IA: Dashboard `/workspace`; Properties `/workspace/inventory`; Publish & Promote `/workspace/publish`; Leads & Inbox `/workspace/leads` (contextual inbox/viewings/routing); Performance `/workspace/analytics`; Settings `/workspace/settings` (agency, members, billing, integrations). Existing advanced editor/publishing workbenches remain via `advanced=1`. Platform routes retain guards and are absent from agency menus. Persona controls exist only in a named testing utility.

Wireframes: dashboard has one editorial welcome/action, an attention list, channel/campaign summary, enquiry/viewing lists and recent activity. Editor has four numbered steps and a persistent save-draft action; optional source-bound suggestions require explicit acceptance and final review. Detail uses a property hero, four next actions, facts/copy and channel/activity panels. Publish & Promote starts with the property and three destination groups, then independent setup, preview, validation, approval and result panels. Advertising additionally has explicit budget and policy/advertiser/final approval stages. Direct messaging never creates an ad or portal job.

UI states: loading, empty new agency, invalid input, dirty draft, saved, stale revision, proposal pending/accepted/rejected, setup missing, quota blocked, validation blocked, approval pending/invalidated, queued locally, simulated ad, prepared sharing draft. Real provider statuses remain unconnected.
