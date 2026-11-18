# Public experience redesign — Phase 19

Local and GitHub `main` inspected at **cf0b187aec5cf7b804b0152b771e829d8f42c72a**, clean at start, verified 2026-11-18. User explicitly authorized the attached complete public website redesign brief, two implementation passes, independent review and local QA. No commit, push or deployment. [OpenSpec](../openspec/changes/0023-public-experience-redesign/proposal.md).

## Confirmed issues and new architecture

Actual baseline captures cover 17 public/entry/showcase templates × EN/AR × 1440/375: [inventory](../artifacts/phase19/before/inventory.json). The hero elevated an editor form instead of the business outcome; the five-tab preview filled a viewport with form inputs, repeated app framing and a second full-workspace mode. AI, journey and benefit sections repeated the same facts. The home had no focused CRM example. Source inspection found piled-on preview CSS and product assets predating the latest CRM changes.

The homepage is rebuilt as: business outcome hero → explicit Create/Prepare/Promote/Follow up story → working source/proposal/human-review example → marketing by purpose → contextual CRM → four user situations → canonical illustrative plans → final demo/contact-preview invitation. Detailed FAQs and the seven-step tour remain directly accessible pages. Removed duplicate homepage journey, benefit cards, six-item AI feature list and homepage FAQ. Each retained section answers a different buyer question.

Hero: light editorial composition, large Manrope value proposition, clear demo/how-it-works actions, current property overview and compact lifecycle labels. A separate native detail of the property's facts appears in Create, avoiding a repeated overview. Prepare isolates the actual Before/Suggested comparison rather than the full inspector; Promote ends after the creative/headline fields. Feature story: forest section, four deliberate chapter controls, concise outcome text and one focused image, without fake chrome or auto-rotation. Native mobile captures preserve readable scale. An image enlargement link is the only screenshot interaction.

AI: the existing `factProposals` parser remains authoritative. Explicit English-labelled fictional notes become proposed fields; review acceptance/reset stays page-local. Supporting language names bilingual copy, campaign preparation and source-grounded CRM guidance without claiming a live model. The current parser limitation remains visible even on Arabic pages.

Marketing: portals/discovery, paid campaigns and direct conversations are grouped by purpose with their actual prerequisite classes. No provider is connected. Google Business Profile remains planned and eligibility unverified. CRM shows the real property/source/agent/viewing context from the fictional inbox; it explains confirmed requirements, human ownership and follow-up without promising delivery or availability.

## Research and design reasoning

Reviewed current primary website content and captured available browser reference images in [research](../artifacts/phase19/research). These are references, not copied layouts or assets. The following are design interpretations from inspection, not measured conversion claims:

- [Linear](https://linear.app/): strong hierarchy and product details anchored to the task; use intentional subject/scale rather than a generic complete dashboard.
- [Attio](https://attio.com/): contextual CRM examples make the action understandable; pair one real detail with its outcome. Its autonomous agent claims do not apply to this prototype.
- [Notion](https://www.notion.com/): a small set of clear action categories provides an understandable product map; use four lifecycle verbs and direct feature destinations.
- [HubSpot](https://www.hubspot.com/): navigation groups buyer intents and makes pricing/demo direct; retain a compact platform disclosure and visible primary destinations.
- [Pipedrive](https://www.pipedrive.com/): practical pipeline/value language and role/industry routes; describe ownership and next action instead of dashboard metrics.
- [Webflow](https://webflow.com/): separate role-oriented stories and product outcomes; translate to real owner/broker/manager/marketer situations without copying its motion or typography.
- [Nielsen Norman Group: progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/): keep essential choices visible and defer advanced details. Applied to explicit chapters, integration prerequisites and the dedicated detailed tour. No essential auto-rotation.
- [Baymard: SaaS website UX](https://baymard.com/research-articles/saas-website-ux-best-practices): show real UI, industry-specific uses, clear pricing terminology and feature links. Applied through genuine focused crops, the agency route and preserved readable pricing matrix. No Baymard statistics are presented as MaxPro performance.
- [web.dev: Web Vitals](https://web.dev/articles/vitals): loading, interactivity and visual stability are distinct measurements. Reserve image space with native source dimensions, keep content server-rendered apart from existing bounded interactions, and report lab values separately from field INP.

Forest/emerald, white/light green, self-hosted Manrope and IBM Plex Sans Arabic preserve the Phase 15 identity in docs/36, which supersedes older stone/eucalyptus examples. No gradients, new illustration assets, animation dependency or customer proof claims are introduced.

## Public page system

| Routes (both locales) | Purpose and treatment |
| --- | --- |
| `/` | New outcome-led composition and explicit four-chapter lifecycle |
| `/solutions` | Shared property starting point plus feature ledger and platform relationships |
| `/solutions/agencies` | Fictional agency day, separated role handoffs and product evidence |
| `/features/property-management` | Saved property facts and next step, structured inventory/media/bilingual/review chapters |
| `/features/ai-assistance` | Actual source-backed suggestion, human review controls, working parser example and bounded CRM/production explanation |
| `/features/publish-and-promote` | Native advertising creative detail, separate channel purposes and approvals; no connected provider claim |
| `/features/leads-and-inbox` | Native property/source/agent context, requirements, follow-ups, inbox and viewing workflow |
| `/how-it-works` | Preserved detailed seven-step explicit tour with readable product evidence |
| `/integrations` | Shared editorial introduction, category navigation, status legend and expandable official prerequisites |
| `/pricing` | Editorial introduction, restrained plan treatment, original quotas and responsive feature matrix |
| `/faq` | Category rail and native keyboard disclosures; avoids repeating home |
| `/contact` | Clearly labelled fictional read-only enquiry preview, never a delivery claim |
| `/about`, `/resources` | Product principles and two existing editorial notes with refined line length/rhythm |
| `/register`, `/sign-in` | Rebuilt entry narrative/lifecycle with the same existing form, hydration, errors and commands |
| `/properties`, `/agencies` and detail/research routes | Preserved secondary showcase, shared navigation/footer; no marketplace promotion |

Shared page hero, typography, buttons, light/dark rhythm, footer and feature evidence layouts apply the same direction across the family. Metadata/sitemap/hreflang and noindex policy remain intact. The sole public assistant remains separate from private records. Its overlap avoidance now recognizes the new screenshot inspection links as visual surfaces, preserving existing CTA protection.

## Evidence and implementation boundaries

`public/product/stories` contains native element captures and exact crops with route, viewport, fictional state, source hash, crop rectangle and final hash. Originals are in `artifacts/phase19/product-originals`. Utility launchers and the sticky workspace shell topbar are omitted solely for unobstructed detail capture; no workflow typography, facts, statuses or controls are restyled for marketing. Final captures use a production server, without development indicators. Existing overview/detail assets and their provenance are also refreshed from current production UI for secondary feature evidence and the tour.

No canonical property/CRM/campaign/organization/publishing engine, schema, quota, backend, authentication or external adapter changes. Small actual assistant overlap adjustment only. Human acceptance, ordered approvals, local queue and remote acceptance remain distinct. Prices QAR 179/725/1,800+, listing quotas 3/25/negotiated and portal quotas 1/2/all authorized stay illustrative pending approval.

Traceability: GEM-01/02/03/05/06/07/08/10/11/13/14/15/16/18/19/21/22/24. GEM-23 remains unimplemented, with future Frappe architecture unchanged.

## Verification and independent review

Initial focused run: 61 passed, 3 failures, all thread-number contrast at 4.43:1. Color was darkened. Independent review additionally identified the Prepare deep link opening the photos step, responsive enlargement context-menu behavior, and a caption font regression; these are repaired rather than accepted as limitations.

Remaining stakeholder gates: final MaxPro/AqarPro identity; approved commercial terms; professional Arabic editorial/native-speaker review; physical-device/Safari/Firefox UAT; licensed production imagery; real Frappe backend, privacy/security/AI approvals and official provider authorization. No production readiness claim follows from frontend test success.

## Final delivery evidence

Both internal passes are complete. Independent review closed all material findings: [review](../openspec/changes/0023-public-experience-redesign/review.md). No canonical engine or schema changed. The assistant's screenshot-surface exclusion is the only workspace behavior adjustment; the complete suite includes its focus, zoom and overlap checks.

Changed implementation: `home-page.tsx`, `product-preview.tsx`, new `focused-shot.tsx`, `feature-page.tsx`, `marketing-layout.tsx`, `marketing-pages.tsx`, `demo-entry.tsx`, the small `assistant-frame.tsx` selector update, removal of obsolete five-preview content from `marketing-content.ts`, and new `public-experience.css` imported by `globals.css`. Existing shared header/footer receive the new public visual system through scoped styles. Three updated regression files plus new `public-experience.spec.ts` cover the changed interactions. No dependency or lockfile change.

Final real browser matrix: **204 route/viewport combinations**, each with full-page and viewport evidence, across 17 templates × two locales × six widths. **Zero document overflow, zero page errors**. [Inventory](../artifacts/phase19/after/inventory.json), [matrix result](../artifacts/phase19/visual-matrix.log). Before capture used the existing development server; after uses the webpack production server. Both use fresh fictional default state and matching 1440×1000 / 375×812 viewports for comparison. The baseline development indicator is not a product element; final production images have none.

| View | Before | Final production |
| --- | --- | --- |
| Homepage desktop | [EN 1440](../artifacts/phase19/before/en-1440-home.png) | [Full page](../artifacts/phase19/after/en-1440-home.png), [viewport](../artifacts/phase19/after/en-1440-home-viewport.png) |
| Homepage mobile | [EN 375](../artifacts/phase19/before/en-375-home.png) | [Full page](../artifacts/phase19/after/en-375-home.png), [viewport](../artifacts/phase19/after/en-375-home-viewport.png) |
| Arabic homepage | [AR 375](../artifacts/phase19/before/ar-375-home.png) | [Full page](../artifacts/phase19/after/ar-375-home.png), [viewport](../artifacts/phase19/after/ar-375-home-viewport.png) |
| Product demonstration | [Oversized viewer](../artifacts/phase19/before/en-1440-home-story.png) | [Create](../artifacts/phase19/after/en-1440-home-story.png), [Prepare](../artifacts/phase19/accessibility/en-1440-chapter-1.png), [Arabic mobile Promote](../artifacts/phase19/accessibility/ar-375-chapter-2.png) |
| AI assistance | [Before](../artifacts/phase19/before/en-1440-ai.png) | [Desktop](../artifacts/phase19/after/en-1440-ai.png), [mobile](../artifacts/phase19/after/en-375-ai.png) |
| Publish & Promote | [Before](../artifacts/phase19/before/en-1440-promote.png) | [Desktop](../artifacts/phase19/after/en-1440-promote.png), [mobile](../artifacts/phase19/after/ar-375-promote.png) |
| CRM | [Before](../artifacts/phase19/before/en-1440-crm.png) | [Desktop](../artifacts/phase19/after/en-1440-crm.png), [Arabic](../artifacts/phase19/after/ar-375-crm.png) |
| Integrations | [Before](../artifacts/phase19/before/en-1440-integrations.png) | [Desktop](../artifacts/phase19/after/en-1440-integrations.png) |
| Pricing | [Before](../artifacts/phase19/before/en-1440-pricing.png) | [Desktop](../artifacts/phase19/after/en-1440-pricing.png), [Arabic mobile](../artifacts/phase19/after/ar-375-pricing.png) |
| Demo entry | [Before](../artifacts/phase19/before/en-1440-entry.png) | [Sign-in](../artifacts/phase19/after/en-1440-entry.png), [registration](../artifacts/phase19/after/en-375-register.png) |
| Assistant open | — | [Mobile](../artifacts/phase19/after/en-375-home-assistant.png), [Arabic mobile](../artifacts/phase19/after/ar-375-home-assistant.png) |

Actual screenshot inspection covered hero, all four chapters, AI, marketing, CRM, audiences, pricing and footer; feature, integration, pricing, entry and assistant screens; mobile/320px wrapping, Arabic RTL and desktop alignment. Review aids: [English desktop](../artifacts/phase19/review/en-1440-pages.jpg), [Arabic mobile](../artifacts/phase19/review/ar-375-pages.jpg). Source imagery is actual app evidence, not generated illustrations. Screenshot enlargement works via keyboard, click and responsive native anchor destinations.

Measured homepage height at identical default state/viewports: EN desktop **7,344 → 6,397px**, EN mobile **10,841 → 9,367px**; AR desktop **7,103 → 6,487px**, AR mobile **10,207 → 8,824px**. These are browser geometry observations, not conversion or human usability measurements.

| Verification | Actual final result |
| --- | --- |
| `CI=true pnpm install --frozen-lockfile` | Passed with registry access after the restricted sandbox attempt could not resolve the registry; lockfile unchanged. Existing optional build-script warning retained. [Log](../artifacts/phase19/install.log) |
| `pnpm typecheck` | Passed. [Log](../artifacts/phase19/typecheck.log) |
| `pnpm lint` | Passed, zero warnings/errors. [Log](../artifacts/phase19/lint.log) |
| `pnpm build` | Known sandbox Turbopack/PostCSS worker port-binding failure, `Operation not permitted`. [Failure log](../artifacts/phase19/build-default.log) |
| `pnpm --dir apps/web build --webpack` | Passed, including TypeScript and localized route generation; final presentation rebuilt after image refinements. [Log](../artifacts/phase19/build-webpack.log) |
| `pnpm --dir apps/web test:e2e --timeout=60000 --trace=off` | **1,157 passed, 45 skipped, zero failures**; 1,202 cases, 6.4 minutes. [Full log](../artifacts/phase19/playwright-full.log) |
| Final focused public run, same command with `marketing.spec.ts website-polish.spec.ts public-experience.spec.ts` | **78 passed**, zero failures after the final image refinements. [Log](../artifacts/phase19/playwright-final-public.log) |
| Final evidence-path regression with `product-experience.spec.ts --grep 'launcher placement'` | **2 passed, 2 expected project skips**; six-width EN/AR focus, zoom, assistant and axe coverage. [Log](../artifacts/phase19/playwright-evidence-path.log) |
| Public whole-document/open-menu axe | **60 scans, zero violations**, EN/AR desktop/mobile, WCAG 2.2 tags. [Reports](../artifacts/phase19/final/interactions) |
| All four story chapters, accepted AI example, open assistant | **72 scans, zero violations, zero overflow**, both locales/all six widths. [Results](../artifacts/phase19/accessibility/results.json) |
| Other retained full-route axe checks | **372 scans, zero violations**. [Reports](../artifacts/phase19/regression/logs) |
| Provenance | All **20 focused images** match hashes; existing **30 detail-crop records** match refreshed source hashes. Native source paths, viewports, state and crop rectangles retained. |
| Source hygiene | `git diff --check` passed; historical artifacts restored byte-for-byte after one older test ignored the evidence-root environment variable. That test now honors it; current captures preserved under Phase 19. [Restoration manifest](../artifacts/phase19/restored-historical-evidence.json) |

Playwright environment: `PLAYWRIGHT_PRODUCTION=1 PLAYWRIGHT_PORT=3219 MAXPRO_EVIDENCE_ROOT=artifacts/phase19/regression` (or `artifacts/phase19/final` for final checks), with `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` set to the installed Chromium headless-shell executable. Browser scripts accept `MARKETING_BASE_URL=http://localhost:3219`. The production server is started with `pnpm --dir apps/web start --port 3219`. Reproduction scripts: `public-redesign-{crops,product,evidence,accessibility,performance,research}.cjs` in `scripts/`.

## Measured performance and practical limits

Lighthouse **13.6.0**, mobile simulated throttling, isolated production localhost runs:

| Locale | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS |
| --- | --- | --- | --- | --- | --- | --- | --- |
| English | **94** | **100** | **100** | **61** | **3.1s** | **40ms** | **0.041** |
| Arabic | **89** | **100** | **100** | **61** | **3.8s** | **30ms** | **0.023** |

[English raw report](../artifacts/phase19/performance/lighthouse-en-mobile.json), [Arabic raw report](../artifacts/phase19/performance/lighthouse-ar-mobile.json). The earlier English run taken concurrently with the full suite scored 51/100 performance and 3,540ms TBT; it is retained [separately](../artifacts/phase19/performance/lighthouse-en-mobile-concurrent.json), not presented as a clean comparison. Isolated scores are the final lab observations, not field guarantees.

**Simulated mobile LCP remains above the 2.5s good threshold.** Production-origin/CDN/cache/font delivery tuning and repeat field measurements remain future work. The hero is discoverable in initial HTML, eager and fetchpriority=high; mobile uses only the native mobile source. The low SEO score reflects the deliberately blocked/noindex prototype and localhost canonical-origin difference (tests intentionally require the configured localhost:3000 canonical). Noindex is retained; no unapproved production origin is invented. Metadata/title/description/hreflang/image-alt and crawlable-link audits pass.

Separate browser lab: 3 cold-cache trials per locale/device; desktop unthrottled, mobile 4× CPU /150ms RTT /1.6Mbps down. Final observed median LCP **72ms EN desktop, 60ms AR desktop, 1,556ms EN mobile, 1,544ms AR mobile**. Maximum CLS **0.0011 /0.0126 /0.0017 /0.0236** respectively. Maximum observed click event duration **48 /40 /48 /56ms**. These scripted interaction samples are **not field INP**. [Raw data and method](../artifacts/phase19/performance/browser-lab.json). Initial homepage JavaScript transfers approximately **264 KiB across 14 script requests**; no new animation/UI library added. Production native hero mobile images are about 18–20KiB. Self-hosted fonts remain the existing TTF sources; further delivery optimization is a documented opportunity.

No performance score, measured page height or axe pass is represented as customer ROI, conversion uplift, full WCAG certification or Arabic editorial approval. Final public experience meets the prototype scope with the remaining production and stakeholder gates stated above.
