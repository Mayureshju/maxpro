# Design

Keep the stone/eucalyptus visual system and task-specific operational layouts. Organization selection is a visible workspace control. The selected organization owns an operational slice: properties, jobs, connectors, CRM, campaigns and assignment settings. Shared directory, memberships and plan definitions remain platform fixtures; audit/review displays filter by selected organization. Preserve the existing Pearl Gate slice and migrate old envelopes without changing canonical IDs. New organizations start empty and use the same guarded workflows.

All domain commands validate selected organization and linked records. Switching resets transient form/approval state and returns to the workspace overview. Persist and validate each slice independently; invalid data cannot leak fixtures into another organization. Roles remain visibly fictional and command permissions remain central. No secure tenant-isolation claim.

Use explicit EN/AR copy and logical CSS. Retain secondary public showcase routes with truthful labels. Contracts stay Frappe independent and include organization context, revision conflicts, field errors, loading and retry behavior. Frappe/database versions remain unresolved pending independent verification; no service is implemented.

Codex authors implementation; request an independent installed-tool review against this same scope. Record unavailable review rather than claiming it.
