# Compact operations and contextual AI — current-state audit

Baseline: local `main` with substantial pre-existing uncommitted Phase 15 changes. No fetch/reset/overwrite. Audit uses the actual running Next.js app on localhost:3000 and current source, not historical defect lists. Before screenshots: `artifacts/phase16/before`; geometry: `before/metrics.json`.

## Confirmed gaps

- Workspace page headings are 34px. Inventory first row begins at y≈565px at 1440×1000 after Intro, two actions, separate counters, collection heading, toolbar and results bar. Leads first row begins at y≈836px. Dashboard repeats five 136px summary cards before operational queues.
- AI is hidden behind editor/portal/campaign/enquiry-specific buttons. There is no global contextual request surface or named AI Property Launch entry.
- Property operations already co-locate facts, media links, channel histories, campaigns and enquiries; improving navigation is appropriate, replacing the page is not.
- Empty dashboards still repeat empty operational panels and zero cards below the existing first-use guide. Preserve the guide's saved-record derivation and organization preference.
- Existing locale/phone screens have working logical layout and reflowing inventory rows. No baseline page overflow was observed in the captured desktop/375px screens. Professional Arabic review remains outstanding; new drawer and launch UI need six-width QA.

## Already solved; regression risks

- Six agency navigation groups, collapse preference, native/source proposal inspector, four-step canonical wizard, Quick Add validation/unsaved protection, first-use guide and canonical public previews exist.
- PublishPromote already separates portals, paid Meta/Google/Click-to-WhatsApp advertising and direct link/message preparation. It preserves unsaved channel forms across goal changes and tab-local navigation choices. Keep its panels and commands.
- `canonical-property` owns optimistic revisions and media; DemoProvider saveProperty invalidates dependent campaign/organization reviews. `syndication-engine` owns setup/readiness/quota/approval fingerprints and per-destination queue/history/idempotency. `campaign-engine` owns separate media budget/service fee and ordered revision-sensitive approvals.
- `lead-crm` retains intake deduplication, source attribution, consent/STOP/handover, assignment, replies and viewings. Analytics uses explicit recorded observations/spend. No invented reporting is needed.
- `local-assistance` and `marketing-ai` are deterministic, source-grounded demonstrations. AssistancePanel snapshots source keys and rejects stale acceptance. No live LLM, extraction or secure tenant boundary exists.

## Milestone

GEM-01–08/10/11/13/14/16/18/19/21/22/24: compact operational primitives and a complete contextual property-to-local-outcome journey. Keep campaign/CRM engines and public showcase compatible. Add only typed future Frappe AI contracts; no backend, external access, credentials or paid calls. Broad CRM/campaign redesign and live integrations remain separate work.
