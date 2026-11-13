# V3 UX direction and acceptance criteria

## Product character
MaxPro is an **operational tool for brokers and agencies**, not a generic AI dashboard. Interface metaphor: a calm, editorial property dossier with efficient operating tables, contextual inspectors and publish workflows. Preserve the v2 Atelier direction (warm stone #f6f6f2, deep eucalyptus #263f37, brass accents) but reduce repeated KPI cards and over-prominent decorative gradients.

## Interaction composition by task
| Task | Preferred composition | Anti-pattern to avoid |
|---|---|---|
| Overview | Action queue + distribution readout + recent leads | Eight repeated metric cards with made-up "growth" figures |
| Property inventory | Dense filterable table/grid and authoritative record | Large decorative cards replacing searchable records |
| Master editor | Sectioned fields, compliance inspector, source/version status | One huge undifferentiated prompt box |
| Media | Ordered room-classified gallery, file previews, process statuses | Generic upload icon with no item controls |
| Connector marketplace | Discoverable provider rows, explicit prerequisites and access | Fake "Connected" stickers on logos |
| Publishing | Steps and per-destination validation/results with separate jobs | One global "Published!" banner without partner acceptance |
| Leads | Pipeline/table, detail, assignment and conversation context | CRM represented only by lead count |
| Analytics | Source performance, cost per qualified lead, filters, provenance | Decorative charts whose numbers cannot be explained |
| Billing | Plan entitlements, usage and quota blockers | Arbitrary prices misaligned with contract requirements |
| Admin | Incident/authorization/connector health table | Marketing-style dashboard for operational support |

## Component library and tokens
Use existing `px-*` primitives and `gm-*` workflows. Next.js App Router + TypeScript. Don't add a second default component library or arbitrary gradients/icons to every view. Rounded corners 2–4px for operations, stronger editorial photo treatment only on the public website. Medium text density, strong contrast, visible keyboard focus, descriptive empty states and precise units/currency.

## Acceptance gates (manual, screenshot required)
1. At **1440px, 1024px, 768px and 375px** no overlap, cut-off controls or unwanted horizontal scroll on the key workflows.
2. Desktop and mobile screenshots taken from the **running Next.js app**, not design mock HTML. Compare dashboard, editor, marketplace, publish, leads and analytics page against direction.
3. Arabic `/ar` screens set `lang=ar`, `dir=rtl`; translations require real Arabic copy, logical CSS, mirrored actions and native speaker review. Current v3 has partial translations and is NOT complete on this gate.
4. Keyboard navigation covers nav, inputs, checkboxes, submit/disabled states, tab order, error alerts and modals; check WCAG AA/axe.
5. Every interactive control has truthful behavior and describes whether it is a local mock. No "live" provider badges, invented external events, imaginary latency, fake financial ROI assertions or fabricated permissions.
6. The canonical demo journey: edit record → save → prepare connector(s) → choose destinations → inspect pre-flight → approve mock → dispatch locally → see per-destination jobs. Unprepared/invalid destinations must be blocked and visible.
7. Check billing plan change affects selection quota; approval and publishing cannot exceed sample plan's connector count.
8. One screen = one dominant task. Avoid repeated full-page four-card templates; use task-native layouts with clear content hierarchy.

## Known prototype polish backlog
- Finish Arabic content for all legacy v2 body screens; ask an Arabic-speaking reviewer.
- Review media design at mobile width; production photo reorder should support drag/drop with keyboard alternative (v3 arrows are only the accessible fallback).
- Phase 5 adds local organization onboarding/directory, role simulation and guards. Production needs authenticated Frappe membership/permissions and organization isolation; Phase 6 adds independent browser-local organization workspaces; this remains UX simulation, not secure isolation.
- Build optimistic/pessimistic states against OpenAPI mocks, including timeouts, 403, invalid IDs, retries, empty provider lists.
- Replace remote stock example images with licensed Qatar content when provided.
