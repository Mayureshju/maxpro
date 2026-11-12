# Design direction — Atelier / MaxPro v2

## What we rejected from starter v1

- Repetitive grids of rounded KPI cards for every functional page.
- Gradient-heavy "AI startup" hero styling and decorative floating gadgets.
- Hero mockups pretending portal integrations are operational.
- Small low-contrast labels and placeholder buttons without a next step.
- A single workspace table as a substitute for a product experience.

## New design rationale

**Editorial / professional / real-estate-first.** Borrow useful discipline from architectural portfolios and specialist B2B software. The aesthetic should be restrained enough to support all-day operations and distinctive enough for an agency technology brand.

Tokens (provisional, **not approved company branding**):

| Purpose | Value |
|---|---|
| Product ink | `#1B292D` |
| Dark surface | `#203B37` |
| Primary interaction | `#255D52` |
| Accent/copper | `#AA774D` |
| Background | `#F6F6F2` |
| Quiet surface | `#F0F1EB` |
| Border | `#DFE1D9` |
| General corner radius | 2–4px for inputs/buttons; cards favor borders over shadows |
| English typography | Good system grotesk; serif (Georgia as safe placeholder) only for editorial headings |
| Arabic typography | Noto Sans Arabic or organization-approved font, RTL direction and logical properties |
| Motion | Essential state feedback only; respect reduced-motion preferences |

## Visual grammar

1. **Public website:** architecture photography, deliberate asymmetry, editorial headline rhythm, property attributes and whitespace. Photography in the starter is Unsplash demo imagery with remote URLs. Replace with licensed organization-approved media before launch; **these are not photos of the example Qatar listings**.
2. **Agency workspace:** 252px navigation, quiet global header and contextual operational pages. Use one informative feature region per page and a small number of meaningful supporting panels.
3. **Data-heavy pages:** tables use strong row hierarchy, readable values, visual status, filtering and sensible inline actions. Tables must remain scrollable on mobile without breaking labels.
4. **Conversation product:** a real split-pane interface with threads, messages and context instead of a generic chat card.
5. **Listing Studio:** a clear six-stage journey. Requirements, source facts, room photo categories and review gates are visible; no false claims about AI extraction.
6. **Commercial product:** high-contrast spending transparency, clear quotas and an explicit approval requirement.
7. **Admin:** prioritize searchable records and action queues, not decorative graphs.

## UI review rubric (score each 0–5 before approval)

- Visual hierarchy and legibility — 5 needed for approval.
- Consistency with brand tokens — at least 4.
- Information density appropriate to the screen — at least 4.
- Mobile layout at 375/768/1280/1440px — at least 4.
- RTL and Arabic text wrapping — at least 4, native speaker review before go-live.
- States: empty, loading, validation, rejection, permissions and offline — all specified.
- Action credibility: any clickable element has a truthful behavior; no false success.
- Accessibility: keyboard focus, semantic headings, accessible controls, contrast, reduced-motion.

No route should be considered **design-approved** from code generation alone. Human review must compare screenshots, annotate issues, and request a bounded design change before implementation proceeds.
