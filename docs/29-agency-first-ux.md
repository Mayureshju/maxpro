# Agency-first UX redesign

Baseline: latest remote `main`, `d7a91222a97a7213d04da105066b842d703e4166`, verified with `git ls-remote`. Scope is the supplied Agency-First SaaS UX Redesign, phases A–H. OpenSpec: `0012-agency-first-ux`. This remains a frontend-only fictional browser demo.

## Customer journey

`/register` captures agency name, organization type, country and a fictional Demo identity. It creates and selects an independent empty workspace and opens the dashboard. `/sign-in` selects an existing fictional agency, including the last-selected agency after reload. Neither page collects a password, email or credential. Agency, broker and landlord entry select their corresponding local personas.

The dashboard prioritizes adding a property, incomplete drafts, local channel/campaign outcomes, new enquiries, viewings and recent activity. A property has four next actions: Edit Property, Improve with AI, Publish & Promote, and View Enquiries.

Property editing has four steps: basic facts; photos and details; optional assistance; review and save. Incomplete drafts can be saved at every step. Source, payment, coordinates and fictional compliance information are contextual. Media reuses the existing workbench and metadata store. Source-labelled fact proposals, bilingual copy and room-category ordering require explicit acceptance. Source changes discard obsolete suggestions. Saving facts does not imply legal verification.

Publish & Promote asks where the selected property should go and groups destinations into property portals, paid advertising, and direct sharing/messaging. Each selected channel has a separate setup, preview, validation, review and local outcome/history. Mobile users can jump from selected channels to their preparation panel.

- Portals use the existing readiness, mapping, quota and revision-bound approval functions. Outcomes remain queued locally, blocked locally, cancelled or revision changed. Bayut/Dubizzle eligibility remains pending.
- Paid Meta/Google campaigns use the existing budget and ordered policy/advertiser/final approval state machine. Click-to-WhatsApp is a Meta campaign with a conversation objective, distinct from WhatsApp messaging. Saving changed campaign content invalidates earlier approvals. No budget is spent.
- Sharing/message preparations have their own versioned subrecord on the canonical property, so they do not revise listing facts or invalidate listing queues/campaign approvals. The guarded provider command binds the reviewed property, preparation revision, content, language and setup. Nothing is delivered.

Lead details and Inbox retain shared property links, assignments, follow-up, viewings, consent and local replies. Contextual assistance summarizes recorded fields and proposes a reply for review; accepting only fills the reply draft. Performance explanations count recorded observations and identify their all-agency scope independently of report filters; they do not predict ROI.

## Updated frontend route / UX map

All paths below are locale-prefixed with `/en` or `/ar`.

| Primary section | Entry | Contextual destinations |
| --- | --- | --- |
| Dashboard | `/workspace` | Add property, attention list, enquiry/viewing links, campaign status |
| Properties | `/workspace/inventory` | `/new`, `/[id]`, `/[id]/edit`, `/[id]/media`, `/[id]/enquiries`, `/[id]/publishing` |
| Publish & Promote | `/workspace/publish?property=[id]` | Per-channel panels; existing `/workspace/campaigns` and `/campaigns/[id]` for campaign management |
| Leads & Inbox | `/workspace/leads` | `/leads/[id]`, `/inbox?lead=[id]`, `/leads/viewings`, `/leads/assignment` |
| Performance | `/workspace/analytics` | Existing source, property, date and campaign observations |
| Settings | `/workspace/settings` | Agency profile, members, billing, brand/showcase, integrations |

| Former top-level area | New placement |
| --- | --- |
| AI Listing Studio | Embedded assistance in editor; original `/workspace/studio` retained |
| Portal/marketing setup | Contextual channel setup or Settings → Integrations |
| Field mapping, feeds, diagnostics | Integrations → Advanced settings; original routes retained |
| Canonical field editor | Property editor → Advanced property editor (`?advanced=1`) |
| Original syndication workbench | Retained at `/workspace/publish?advanced=1`; domain regression tests opt in explicitly |
| Persona / organization controls | Settings → Advanced settings → Demo/testing utilities |
| Platform administration | Isolated development routes; no normal agency navigation; local role guards retained |
| Public property/agency pages | Preserved secondary showcase |

## Implementation and review

Reusable engines remain in `canonical-property`, `syndication-engine`, `connector-engine`, `campaign-engine`, `lead-crm` and `organization-engine`. The existing versioned browser-local repository persists organization slices, facts, media, jobs, campaigns and enquiries. The additive optional `property.sharing` subrecord is projected and validated during restoration; old records need no migration.

The separate read-only review required by AGENTS.md identified stale form rebasing, stale ad edits, sharing invalidation, testing-role recovery, outdated proposals, role selection and residual admin links. These were corrected. Isolated Chrome checks confirmed stale-tab rejection, explicit campaign reload, unchanged listing/campaign revisions on sharing, role recovery and landlord registration. Automated coverage also exercises these boundaries.

Requirement coverage: GEM-01–08, GEM-10–16, GEM-18/19, GEM-21/22/24. GEM-17 showcase is preserved. GEM-20 platform tools remain isolated. GEM-23 remains entirely unimplemented; the approved future architecture is Frappe.

## Actual browser evidence

Captured from the running Next.js application, not generated illustrations:

- [Before dashboard](../artifacts/agency-first/before/dashboard-1440.png) and [after dashboard](../artifacts/agency-first/after/en-1440-dashboard.png).
- [Before publishing](../artifacts/agency-first/before/publishing-1440.png) and [after publishing](../artifacts/agency-first/after/en-1440-publishing.png).
- [Arabic mobile publishing](../artifacts/agency-first/after/ar-375-publishing.png) and [English mobile registration](../artifacts/agency-first/after/en-375-registration.png).
- `artifacts/agency-first/after/{en,ar}-{1440,1024,768,375}-*.png` contains the route matrix. Interactive AI-review and portal-result captures accompany the journey tests.
- `artifacts/agency-first/regression` holds the retained engine, route, visual and accessibility evidence.

Desktop and mobile captures were visually inspected for hierarchy, RTL, clipping, task actions and overflow. Arabic still needs professional editorial completion.

## Verification

Final acceptance: **843 passed, 35 expected skips, 0 failures**. Typecheck, lint and the webpack production build passed. Exact results are recorded in `artifacts/agency-first/verification.md`. The test runner uses installed local Chrome through `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` and a separate production server on port 3100. Existing domain/workbench tests explicitly open the retained advanced routes; customer-journey tests exercise the new default screens.

`pnpm build` encountered a host restriction: Turbopack's CSS worker could not open a local port, including on the escalated retry. `pnpm build --webpack` uses Next.js's supported alternative build path and completed production output. No dependency or backend framework was added to work around the host restriction.

## Remaining UX / production gaps

- Native-speaker Arabic review and full translation completion remain required, including source-supplied text and some advanced history labels.
- AI assistance is deterministic and limited to labelled notes/current facts; no document, voice, image extraction or live model runs. Fact proposals recognize explicit English field labels; Arabic source-note parsing remains a gap.
- Uploaded media retains metadata and temporary previews; secure binary storage and processing remain future backend work.
- Provider access, official schemas/country eligibility, real authentication, secure tenant isolation, spend, messaging, analytics, payments and Frappe remain unimplemented.
- Browser coverage uses Chromium desktop/mobile emulation; physical devices and Safari/Firefox need later UAT.
- Advanced workbenches remain available and retain their richer operational detail. They are outside the primary agency navigation.

No deployment, commit or push was performed. The pre-existing generated `next-env.d.ts` changes are preserved.
