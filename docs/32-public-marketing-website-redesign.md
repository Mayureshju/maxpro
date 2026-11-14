# Phase 11 — public SaaS website

Baseline `a22d192a5417bea79a532bb2f1caf4f4d75c5ad4`. [OpenSpec 0015](../openspec/changes/0015-public-website-experience/proposal.md). Frontend-only; existing canonical property, CRM, campaign, organization and publishing engines remain authoritative. No backend, deployment, commit or push.

## Audit and direction

| Priority | Finding | Implementation direction |
| --- | --- | --- |
| P1 | Architecture-photo hero hides the software; feature statements offer little inspectable evidence | Product-led hero and actual screenshot assets; accessible four-screen preview; dedicated feature evidence |
| P1 | Header takes buyers into advanced internal Connector Hub and gives showcase equal billing | Public platform/agency/features/integrations/pricing navigation; existing demo sign-in as primary conversion; showcase in footer |
| P1 | Missing dedicated walkthrough and integrations explanation | Seven-step educational tour; status/prerequisite directory grouped by purpose |
| P1 | Pricing lacks a readable feature matrix and visible explanations | Canonical plan source, visible quotas, grouped matrix, feature links and local agency-enquiry path |
| P1 | Shared locale layout gives child pages the homepage canonical | Per-route localized metadata, alternates and social previews; workspace/account noindex |
| P1 | Mobile menu lacks dialog focus/Escape/scroll handling | Native modal dialog, automatic focus containment, close control, Escape and restoration |
| P2 | Generic about/contact/FAQ/resources omit practical buyer context | Product principles, read-only fictional enquiry, grouped native accordions and two substantial existing-topic notes |
| P2 | Mobile software screenshots could become illegible scaled desktop views | Actual narrow-screen captures selected through picture sources, with desktop enlargement link |
| P2 | Arabic mostly depends on scattered copy translation | Explicit bilingual marketing content, Arabic RTL typography and logical layout; professional review remains pending |
| P2 | Generic layouts repeat and animation lacks a clear purpose | Different compositions for proof, workflow, editorial story, directory and comparison; only restrained opacity/transform motion |

Baseline: 76 full-page real-app captures: 19 existing public/entry/showcase/research templates × EN/AR × desktop/mobile. [Inventory](../artifacts/phase11/before/inventory.json). No document overflow found. The design audit also inspected the actual source, shared tokens, existing logo and sample media provenance.

## Research applied

- [Baymard SaaS UX research](https://baymard.com/research-articles/saas-website-ux-best-practices): show actual UI early, provide relevant industry context, explain matrix terminology and link features to detail. Applied to previews, agency walkthrough and pricing.
- [web.dev CSS and Web Vitals](https://web.dev/articles/css-web-vitals): reserve visual space and avoid expensive layout/paint animation. Applied through image dimensions and opacity/transform-only transitions.
- [W3C interaction animation guidance](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions): respect reduced-motion preferences; no autoplay, parallax or continuous effects.
- [Next.js metadata conventions](https://nextjs.org/docs/app/getting-started/metadata-and-og-images): route metadata remains server-owned; explicit locale alternates and screenshot social images.
- [Linear](https://linear.app/) was reviewed for product evidence and hierarchy, and [Reapit](https://www.reapit.com/) for agency-task language and feature specificity. No layouts, graphics, claims, customer marks or assets were copied.

## Implemented IA and content

Home → Platform (`/solutions`) → Guided tour (`/how-it-works`) → four features (`property-management`, `publish-and-promote`, `ai-assistance`, `leads-and-inbox`) → proposed integrations (`/integrations`) → agency workflow (`/solutions/agencies`) → pricing → about/contact/FAQ. `/resources` retains the useful structured-information/bilingual topics as two concise notes. Existing public showcase, agency profile, saved research, legal and demo entry URLs remain compatible.

Homepage progression: actual agency view; four-screen proof; five-step workflow; authoritative property record; real deterministic field proposal; three distribution purposes; source-linked CRM; agency use cases; illustrative plans; eight FAQs; demo invitation. Feature pages explain daily tasks and actual limitations rather than claiming live services.

`publicBrand` centralizes the working identity and existing logo reference. The approved AqarPro asset remains unchanged. MaxPro/AqarPro naming is unresolved; the footer flags it. The existing M favicon remains to avoid an unauthorized asset/identity change.

All plan numbers come from `geminiPlans`. Agency quotas remain negotiated, not an invented unlimited entitlement. Provider concepts reference `connectorCatalog`; the directory distinguishes local demonstration, planned production, authorization requirements and no connectivity. Click-to-WhatsApp is an advertising concept, not a newly invented adapter.

Assistance example calls existing `factProposals`, showing the same explicit-label parser as the property editor. Acceptance is page-local and never mutates canonical state. Contact has read-only fictional name/email/message and a memory-only preview; it has no submission endpoint or personal input. No performance figures, customers, testimonials, compliance badges or partnerships are invented.

## Technical decisions

Server-rendered marketing pages use shared layout/heading/CTA/evidence primitives. Client islands own product tabs, workflow selection, assistance acceptance, contact preview and header navigation. Native details support FAQs and compact feature navigation. `mk-*` styles live in a separate public stylesheet; workspace layouts/engines are not redesigned.

Product images are genuine EN/AR production-app captures in `public/product`, with source-route/viewport manifests and provenance. Mobile images are genuine 375px captures; desktop images are 1440px. WebP conversion changes encoding only. Existing sample property photography is reused under the existing prototype provenance; no new third-party photo/license claim.

Motion: 160–180ms hover/header/disclosure, 220–240ms interactive screenshot changes, 450–500ms first hero entrance. No content waits for a scroll observer or JS reveal to become visible. Existing global reduced-motion rules plus scoped rules remove nonessential motion. No animation dependency added.

SEO uses per-route localized titles/descriptions/canonical/hreflang/OG/Twitter. No homepage canonical is inherited. `NEXT_PUBLIC_SITE_URL` must be an approved origin at production launch; otherwise metadata resolves to localhost and robots blocks indexing the prototype. The sitemap contains public marketing and directory roots only; fictional workspace, account, saved research and detail URLs are excluded. No unsupported structured data or analytics collection is added.

## Verification and known limits

Native-speaker Arabic approval, physical-device/Safari/Firefox testing, approved production origin/name, licensed production photography and real provider/backend implementation remain outside this phase. Web Vitals targets are not claimed without measured evidence.

The independent read-only review found a tour evidence mismatch, obsolete client-only informational branches and a possible mobile desktop-image preload. The tour now uses the matching publishing-preparation screen; campaign imagery shows the selected property's advertising workflow. Unused legacy homepage/platform/router/forms were removed after consumer checks. Picture images use eager/high fetch priority for the hero without a desktop-specific preload, allowing the mobile source to load alone. Browser network evidence verifies this below.

The first interaction pass found native-dialog tab cycling could reach browser chrome, and muted step labels failed contrast. The menu now explicitly cycles Tab/Shift+Tab at its boundaries. Step text was darkened and text entrance keeps full opacity. The repaired focused run passed all 42 cases, including full-document axe on the marketing pages and open menus.

The original default localhost port also had a pre-existing development server listening over IPv6. It was left running. Final browser verification uses our separate production server on port 3211. This prevents a development response from being mistaken for the tested production output.

Cleanup removed three obsolete exports, narrowed informational content to legal/showcase consumers, and removed 47 rules for confirmed unused public classes. The existing FAQ regression follows the redesigned public labels/selectors while retaining expansion assertions. The enterprise regression's capture path now honors `MAXPRO_EVIDENCE_ROOT`, preserving historical screenshot bytes.

## Page inventory and evidence

| Destination | Buyer intent | Evidence / interaction |
| --- | --- | --- |
| `/` | Understand the product and explore | Actual dashboard, four preview tabs, five-step flow, assistance parser, channel distinctions and FAQ |
| `/solutions` | Understand the whole platform | Inventory screenshot, connected-record model, four feature destinations and audiences |
| `/how-it-works` | Learn the complete journey | Seven steps, current-step feedback, back/next and contextual demo links |
| `/features/property-management` | Evaluate the canonical property workflow | Editor, media screen and facts/bilingual/review chapters |
| `/features/publish-and-promote` | Distinguish listing, ads and sharing | Goal selection, populated advertising preparation, validation/approval/history explanation |
| `/features/ai-assistance` | Understand bounded assistance | Actual proposal inspector, existing deterministic parser and human acceptance example |
| `/features/leads-and-inbox` | Evaluate enquiry follow-up | Actual CRM and inbox, source/property/agent/viewing context |
| `/integrations` | Review intended channels and access | Four categories, eight concepts, explicit availability and expandable prerequisites |
| `/solutions/agencies` | Match the software to a team's day | Labelled fictional owner/broker/manager/agent walkthrough and real dashboard |
| `/pricing` | Compare proposed plans | Canonical figures, visible limits, grouped comparison and feature links |
| `/about`, `/contact`, `/faq`, `/resources` | Understand purpose, try enquiry UI, resolve questions, learn principles | Honest product direction, read-only fictional form, grouped accessible disclosures and two useful notes |
| `/properties`, `/properties/[id]`, `/agencies`, `/agencies/[id]` | Secondary fictional showcase | Preserved search/cards/details/agency portfolio with the shared public navigation/footer |
| `/favorites`, `/compare`, `/saved-searches`, `/map` | Bookmarked research compatibility | Existing local research behavior retained; noindex |
| `/privacy`, `/terms`, `/register`, `/sign-in` | Draft legal information and fictional entry | Existing legitimate routes retained; route metadata and noindex |

Traceability: GEM-01–08, GEM-10–19, GEM-21/22/24 are explained or preserved at prototype level; GEM-09/20 advanced workspace compatibility remains intact. GEM-23 remains unimplemented. No production authorization, delivery, security, billing or AI claim is added.

[Before inventory](../artifacts/phase11/before/inventory.json), [after inventory](../artifacts/phase11/after/inventory.json) and [screenshot manifest](../artifacts/phase11/screenshot-manifest.json) enumerate every route/viewport and all genuine product assets.

| View | Before | After |
| --- | --- | --- |
| Homepage desktop | [EN 1440](../artifacts/phase11/before/en-1440-home.png) | [EN 1440](../artifacts/phase11/after/en-1440-home.png) |
| Homepage mobile | [EN 375](../artifacts/phase11/before/en-375-home.png) | [EN 375](../artifacts/phase11/after/en-375-home.png) |
| Arabic homepage | [AR 375](../artifacts/phase11/before/ar-375-home.png) | [AR 375](../artifacts/phase11/after/ar-375-home.png) |
| Platform | [EN 1440](../artifacts/phase11/before/en-1440-solutions.png) | [EN 1440](../artifacts/phase11/after/en-1440-solutions.png) |
| Pricing | [EN 1440](../artifacts/phase11/before/en-1440-pricing.png) | [EN 1440](../artifacts/phase11/after/en-1440-pricing.png) |
| Contact | [AR 375](../artifacts/phase11/before/ar-375-contact.png) | [AR 375](../artifacts/phase11/after/ar-375-contact.png) |

Interaction captures include [selected product preview](../artifacts/phase11/interactions/en-selected-product-preview.png), [prepared workflow step](../artifacts/phase11/interactions/en-selected-workflow-review.png), [Arabic open mobile menu](../artifacts/phase11/interactions/mobile-chromium-ar-menu-open.png), [expanded prerequisite](../artifacts/phase11/interactions/en-integration-prerequisites.png), [hero keyboard focus](../artifacts/phase11/interactions/en-hero-keyboard-focus.png), [expanded FAQ](../artifacts/phase11/interactions/chromium-ar-faq-focus.png), [pricing detail](../artifacts/phase11/interactions/mobile-chromium-ar-pricing-details.png) and [reduced motion](../artifacts/phase11/interactions/chromium-en-reduced-motion.png).

Visual review inspected desktop page hierarchy, top/middle/bottom compositions, mobile and 320px wrapping, Arabic alignment and mixed-language content, actual mobile screenshot readability, shared footer, open navigation, pricing region and focus states. [Contact sheets](../artifacts/phase11/contact-sheets) retain the review views. The matrix records 312 real-app captures (26 route templates × two locales × six widths) with no document overflow. A short 768×400 viewport is included in the reduced-motion/layout tests; native dialogs scroll within short viewports. The final caption-motion repair changes only the transition, leaving the settled matrix appearance unchanged.

## Final verification

| Command / check | Actual result |
| --- | --- |
| `CI=true pnpm install --frozen-lockfile` | Passed with approved registry access after sandbox DNS/offline-cache attempts failed. Lockfile unchanged; existing optional-script policy retained. |
| `pnpm typecheck` | Passed. [Log](../artifacts/phase11/typecheck.log). |
| `pnpm lint` | Passed without warnings. [Log](../artifacts/phase11/lint.log). |
| `pnpm build` | Failed at documented sandbox Turbopack/PostCSS worker port binding, `Operation not permitted`. [Actual failure](../artifacts/phase11/build-default.log). |
| `pnpm --dir apps/web build --webpack` | Passed; this is the production output used for final browser verification. [Log](../artifacts/phase11/build-webpack.log). |
| `pnpm --dir apps/web test:e2e --timeout=60000 --trace=off` with production/evidence/browser environment | **961 passed, 37 expected skips, zero failures** (998 total, 3.4 minutes). [Final full log](../artifacts/phase11/playwright-full.log). |
| Full route/document axe | **372 checks, zero violations** across EN/AR desktop/mobile; [reports](../artifacts/phase11/regression/logs). |
| Marketing full-document/open-menu axe | **60 checks, zero violations** including WCAG 2.2 tags; [reports](../artifacts/phase11/interactions). |
| Six-width browser matrix | **312 captures, zero document-overflow findings**, EN/AR 1440/1280/1024/768/375/320. [Log](../artifacts/phase11/visual-matrix.log). |
| Independent review | Repairs reviewed; no remaining blocking finding. [Review](../openspec/changes/0015-public-website-experience/review.md). |
| Source hygiene | `git diff --check` passed; no canonical engine/schema, dependency/lockfile or historical evidence changes. |

The initial full regression recorded 952 passes, 37 skips and nine failures: four old FAQ selectors, two now-ambiguous price assertions and three transient caption-contrast findings. Selectors were scoped to the new public controls without weakening their assertions. Product/tour transitions now preserve full text opacity. The final full run above supersedes that initial run; its [initial log](../artifacts/phase11/playwright-full-initial.log) remains for transparency. All prior tests are retained, 42 marketing cases were added, and route discovery automatically added 28 new locale/project checks.

The 37 skips are retained duplicate-project/tablet cases, not unimplemented feature checks. Chromium desktop/mobile emulation is real-browser evidence but does not establish Safari, Firefox or physical-device approval. Screenshot review verifies the visible compositions and interactions; it does not constitute native-speaker Arabic sign-off. [Reproduction notes](../artifacts/phase11/verification-method.md).

## Browser lab performance

Twelve actual homepage samples in Chromium 145.0.7632.6: three per language/device profile, cold browser cache against the warmed local production server. Mobile uses 4× CPU throttling, 150 ms RTT and 1.6 Mbps download; desktop is unthrottled. [Raw PerformanceObserver/CDP/resource evidence](../artifacts/phase11/performance/browser-lab.json), [console summary](../artifacts/phase11/performance.log).

| Profile | Observed LCP range | CLS | Largest sampled tab interaction |
| --- | --- | --- | --- |
| EN desktop | 56–80 ms | 0 in all samples | 40 ms |
| AR desktop | 52–64 ms | 0 in all samples | 40 ms |
| EN throttled mobile | 1,320–1,324 ms | 0 in all samples | 48 ms |
| AR throttled mobile | 1,300–1,312 ms | 0 in all samples | 40 ms |

The mobile network traces fetch the mobile dashboard screenshot and **zero desktop product screenshots** on initial load in all six mobile samples. Initial resource transfer totals were approximately 318–320 KiB mobile and 380–393 KiB desktop. These local browser lab LCP/CLS observations meet the stated numerical targets under this setup only. They do not establish production Core Web Vitals, real-user INP, real-device performance or a Lighthouse score. The interaction samples are Event Timing entries, not a field INP measurement. No Lighthouse package/dependency was added.

The working logo/name, commercial prices and entitlement definitions still require their existing approvals. Arabic needs professional native-speaker completion/review. The public origin must be supplied at launch. Production photography rights, official provider access, backend/authentication/tenant authorization, AI, payments and communication services remain outside the frontend prototype. No backend, deployment, commit or push was performed.
