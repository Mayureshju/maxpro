# Design

Keep CRM schema version 1 and original identities. Optional `requirements` and `followUps` extend each CanonicalLead. Absence means unrecorded/empty, never fabricated defaults. Hydration reconstructs safe known fields; malformed extensions are discarded with recovery indicated while retaining valid legacy lead data. Organization slices already persist CRM; do not introduce a second store.

New commands use a canonical lead snapshot token for conflict detection, central lead.work permissions and validated organization/property/member references. Task changes append activity and maintain an explicit completed/cancelled history. Dates use labelled Qatar time, consistent with existing viewings. Tasks are records, not scheduled notifications. Completion requires an outcome. Rescheduling requires review of the current record. No new automatic sending.

Confirmed requirements are separate from generated candidates. A conservative deterministic parser reads explicitly labelled inbound message fields and retains a message reference per candidate. Review edits a form; only explicit confirmation saves canonical requirements. Matching reads confirmed constraints and selected-organization properties, normalizes rental periods, excludes archived listings and states that availability is unverified. No listing is invented or automatically selected.

Reuse AssistancePanel and the single existing Copilot. Add record-backed summary, qualification/matching entry, viewing preparation, daily briefing and stage/source explanations; keep public assistant independent of private state. Proposal source snapshots include lead, linked property and draft. Acceptance never sends or approves.

Use existing typography/tokens/primitives, semantic forms and progressive disclosures. Compact next-action rows and phone records replace horizontal-only CRM dependence. Public changes clarify the end-to-end journey and marketing audience without replacing working hero/product evidence. All new operational labels have English/Arabic variants and logical CSS.
