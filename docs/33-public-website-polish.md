# Phase 12 — public website polish

2026-11-15. Baseline `a2d34f0634568cdd8a9dfc044161c5cf94d670f4`. [OpenSpec 0016](../openspec/changes/0016-public-website-polish/proposal.md). Frontend-only; the Phase 11 identity, agency workspace, fictional demo and public showcase remain intact. No commit, push or deployment.

## Audit and changes

Reviewed the source and actual running pages: Home, Platform, How It Works, all four features, Integrations, Agency, Pricing, About, Contact, FAQ and EN/AR mobile navigation. The review considered an agency owner finding the product, a broker inspecting a listing, a manager evaluating handoffs and someone comparing plans. These are design-review perspectives, not invented participant sessions.

| Priority | Confirmed defect | Implemented change |
| --- | --- | --- |
| P1 | Home repeats dashboard, tour, parser, distribution, CRM and full pricing; EN mobile is 14,352px long | One interactive product preview, compact property-to-enquiry journey, three benefits, agency value, short pricing invitation, four FAQs and final action. Detailed workflows remain on dedicated pages. |
| P1 | AI review inspector shrinks inside a complete 1440px screenshot and a half-width column | Real inspector crop at 440px desktop, showing source, before/proposed copy and human acceptance. Heading and copy align at the top. |
| P1 | Screenshot enlargement always opens desktop evidence | Responsive link follows the actual displayed asset, including keyboard activation and screen resizing. Native new-tab enlargement, no lightbox dependency. |
| P1 | Wide feature details become unreadable on phones | Native mobile detail crops, plus genuine production-app campaign/inbox task captures; desktop context remains available. Every overview/detail button changes the evidence. |
| P2 | Sign in implies a real account; navigation destinations compete | Return to demo explicitly means fictional agency selection. Guided tour, interactive demo, new demo agency, public integrations and pricing have clear labels and routes. Current feature/route is indicated. |
| P2 | Integration directory repeats four status definitions and authorization paragraphs | Four category jump links, concise purpose/preparation rows, explicit unconnected status on all eight concepts, keyboard-accessible prerequisites and one shared availability explanation. |
| P2 | Mobile pricing requires horizontal scanning and loses plan context | Three named plan values stack beside each feature. Canonical quotas remain visible; desktop retains a semantic comparison table. Agency action opens a read-only enquiry preview. |
| P2 | Small labels/captions, repeated compositions and excessive spacing | Readable captions and body copy, shorter section spacing, restrained editorial benefits, property lifecycle links, publishing purposes, AI input/proposal/review and sequential CRM handoffs. |

Platform, About, Contact and FAQ retain their substantive content and gain shared type, screenshot/navigation and spacing improvements. The agency walkthrough remains explicitly fictional. No unsupported customer, performance, certification, partnership or live-service claim was added.

## Navigation and conversion

- Learn: `/solutions` explains the platform; contextual feature links stay public.
- Guided tour: `/how-it-works` introduces the complete fictional journey.
- Try or return: `/sign-in` selects a fictional agency; the primary CTA and Return to demo accurately use that shared chooser. There is no real authentication.
- Start empty: `/register` creates a browser-local fictional agency; the mobile menu exposes this separately from returning.
- Compare: `/pricing` preserves Starter/Pro/Agency. Starter/Pro actions explore the fictional demo; Agency opens `/contact` for a preview with no submission. Actions do not claim to apply a subscription or purchase a plan.
- Header feature disclosure, Escape/focus restoration, modal menu focus cycle, scroll lock, current route, locale/query/hash preservation and contextual feature links remain supported.

## Product evidence

[Crop generator](../scripts/website-polish-crops.cjs) creates **30 exact screenshot crops**: 16 desktop and 14 native mobile. [Crop provenance](../apps/web/public/product/detail-provenance.json) records source filenames, SHA-256, rectangles and transformation. The desktop overview uses the actual crop source (`publish → review`, `leads → inbox`). All original Phase 11 product captures and provenance remain unchanged.

Four additional unaltered mobile task captures show campaign creative and the property-linked conversation in the running Webpack production app. Their [capture provenance](../apps/web/public/product/task-mobile-provenance.json) records locale, route, viewport, source and hash. Only WebP encoding and documented exact crops are used; no interface is drawn or synthesized.

ProductShot exposes selected/unselected view controls, visible keyboard focus, descriptive alt/caption, responsive source dimensions, loading priority for the hero and lazy loading elsewhere. Only the active product tab renders its evidence. Captions follow images; mobile hero tabs follow the preview so controls do not postpone the first product pixels. Native mobile detail crops avoid reducing the 1128px desktop publishing screen to a 337px thumbnail. Enlargement opens the currently selected detail or overview.

## Before and after

Screenshots come from the actual Next.js application. Baseline captures used the existing development server and may include its Next.js development badge; final captures use a separate Webpack production server. No illustrative render substitutes for browser evidence. Baseline preview regions are exact crops of the original full-page capture, with [region provenance](../artifacts/phase12/before/derived-regions.json); the initial scroll-viewport attempt is retained but is not used as preview evidence.

| View | Before | After |
| --- | --- | --- |
| Home desktop / mobile | [1440](../artifacts/phase12/before/en-1440-home.png), [375](../artifacts/phase12/before/en-375-home.png) | [1440](../artifacts/phase12/after/en-1440-home.png), [375](../artifacts/phase12/after/en-375-home.png) |
| Product preview | [Desktop](../artifacts/phase12/before/en-1440-product-preview-region.png), [mobile](../artifacts/phase12/before/en-375-product-preview-region.png) | [Desktop](../artifacts/phase12/after/en-1440-product-preview.png), [mobile](../artifacts/phase12/after/en-375-product-preview.png) |
| AI assistance | [Desktop](../artifacts/phase12/before/en-1440-features-ai-assistance.png), [mobile](../artifacts/phase12/before/en-375-features-ai-assistance.png) | [Desktop](../artifacts/phase12/after/en-1440-features-ai-assistance.png), [mobile](../artifacts/phase12/after/en-375-features-ai-assistance.png) |
| Publish & Promote | [Desktop](../artifacts/phase12/before/en-1440-features-publish-and-promote.png), [mobile](../artifacts/phase12/before/en-375-features-publish-and-promote.png) | [Desktop](../artifacts/phase12/after/en-1440-features-publish-and-promote.png), [mobile](../artifacts/phase12/after/en-375-features-publish-and-promote.png) |
| Integrations | [Desktop](../artifacts/phase12/before/en-1440-integrations.png), [mobile](../artifacts/phase12/before/en-375-integrations.png) | [Desktop](../artifacts/phase12/after/en-1440-integrations.png), [mobile](../artifacts/phase12/after/en-375-integrations.png) |
| Pricing | [Desktop](../artifacts/phase12/before/en-1440-pricing.png), [mobile](../artifacts/phase12/before/en-375-pricing.png) | [Desktop](../artifacts/phase12/after/en-1440-pricing.png), [mobile](../artifacts/phase12/after/en-375-pricing.png) |
| Agency solution | [Desktop](../artifacts/phase12/before/en-1440-solutions-agencies.png), [mobile](../artifacts/phase12/before/en-375-solutions-agencies.png) | [Desktop](../artifacts/phase12/after/en-1440-solutions-agencies.png), [mobile](../artifacts/phase12/after/en-375-solutions-agencies.png) |
| Mobile navigation | [EN](../artifacts/phase12/before/en-375-navigation.png), [AR](../artifacts/phase12/before/ar-375-navigation.png) | [EN](../artifacts/phase12/after/en-375-navigation.png), [AR](../artifacts/phase12/after/ar-375-navigation.png) |
| Arabic home | [Desktop](../artifacts/phase12/before/ar-1440-home.png), [mobile](../artifacts/phase12/before/ar-375-home.png) | [Desktop](../artifacts/phase12/after/ar-1440-home.png), [mobile](../artifacts/phase12/after/ar-375-home.png) |

[Baseline inventory](../artifacts/phase12/before/inventory.json), [final inventory](../artifacts/phase12/after/inventory.json) and [contact sheets](../artifacts/phase12/contact-sheets) support the comparisons. Review inspected actual focal points, screenshot content, phone readability, mixed-script labels, open navigation and page length, rather than treating overflow checks as design approval.

## Arabic, mobile and motion

Arabic hero/benefit copy was edited for shorter, natural headings; mixed provider names and QAR prices use bidi isolation. RTL navigation, alignment, screenshots, touch controls and arrow direction are preserved. This is not a claim of complete Arabic coverage or native-speaker approval. The plan comparison deliberately becomes longer when all values are stacked, trading horizontal scanning for explicit plan context.

CSS retains restrained header feedback, tab selection and screenshot transitions. No autoplay, parallax, scroll hijacking, hidden-on-scroll content or motion dependency. Reduced motion removes transitions/animations. CPU-throttled interactions, 200% CSS zoom, 320px width and short viewports are exercised in the new browser tests.

## Scope, review and cleanup

GEM-01 (fictional entry/team), GEM-02–04 (canonical properties/media/bilingual), GEM-05–08/10–12/16 (proposed channels and review), GEM-13–15/24 (linked CRM/follow-up/reporting preserved), GEM-18/19 (canonical illustrative plans), GEM-21/22 (reviewed simulated assistance/responsive UI). GEM-09/17/20 compatibility remains intact; GEM-23/backend is unimplemented.

Only public marketing source/CSS, public screenshot additions, tests, evidence scripts and documentation changed. No canonical engine, command, local-state schema, workspace UI, dependency manifest or lockfile changed. [Cleanup manifest](../artifacts/phase12/cleanup-manifest.json) records 68 obsolete homepage selector branches and 38 exactly shadowed declarations removed from marketing CSS. No repository-wide cleanup.

The independent reviewer used the same OpenSpec scope. It found the first-pass mobile hero placement, AI grid alignment, unreadable mobile desktop crops and mismatched crop/overview sources; these were repaired. A final review verified all 30 crop hashes/dimensions and confirmed no remaining blocking finding. [Review record](../openspec/changes/0016-public-website-polish/review.md).

## Verification

The final six-width matrix covers all 13 audited pages × two locales × six widths (1440/1280/1024/768/375/320): **156 real-app captures, zero document overflow**. [Matrix log](../artifacts/phase12/visual-matrix.log).

| Homepage | Baseline height | Final height | Reduction |
| --- | ---: | ---: | ---: |
| EN 1440 | 11,330px | 4,856px | 57.1% |
| EN 375 | 14,352px | 6,975px | 51.4% |
| AR 1440 | 11,240px | 4,779px | 57.5% |
| AR 375 | 13,783px | 6,687px | 51.5% |

[Measured visual summary](../artifacts/phase12/visual-summary.json). These describe the actual local rendered pages, not customer performance metrics.

| Command / check | Actual result |
| --- | --- |
| `CI=true pnpm install --frozen-lockfile` | Passed with approved npm access; lockfile unchanged. Sandbox offline store was incomplete. Existing optional-script policy unchanged. [Log](../artifacts/phase12/install.log). |
| `pnpm typecheck` | Passed. [Log](../artifacts/phase12/typecheck.log). |
| `pnpm lint` | Passed, no warnings. [Log](../artifacts/phase12/lint.log). |
| `pnpm build` | Failed at the documented Turbopack/PostCSS sandbox worker-port restriction (`Operation not permitted`). [Actual failure](../artifacts/phase12/build-default.log). |
| `pnpm --dir apps/web build --webpack` | Passed, 167 generated pages; this production output served final browser verification. [Log](../artifacts/phase12/build-webpack.log). |
| `pnpm --dir apps/web test:e2e --timeout=60000 --trace=off` | **983 passed, 37 existing expected skips, zero failures; 1,020 total.** [Full log](../artifacts/phase12/playwright-full.log). |
| Full-document accessibility | **372 checks, zero violations** across EN/AR desktop/mobile. [Reports](../artifacts/phase12/regression/logs). |
| Marketing / open-menu accessibility | **60 checks, zero violations** including WCAG 2.2 tags. [Reports](../artifacts/phase12/regression/interactions). |
| Independent visual/control review | No remaining blocking finding after repairs; all 30 crop hashes/dimensions verified. |
| Source hygiene | `git diff --check` passed; canonical engines/state, dependency/lockfile, approved logo and historical evidence unchanged. |

Twenty-two new desktop/mobile cases cover responsive screenshot enlargement/mode selection, crop source hashes, buyer and feature navigation, fictional entry, integration disclosure, named mobile plan comparison, six-width layout, 200% CSS zoom, short viewports, keyboard controls and 4× CPU/reduced-motion behavior. Existing workspace tests remain intact. Existing marketing assertions follow the meaningful responsive image/stacked comparison behavior and write evidence into Phase 12 instead of historical Phase 11.

Initial focused runs recorded 57/62 passes with 7/2 failures. They identified CSS-zoom price overflow, a responsive image-load timing assertion, path normalization and missing native-mobile detail variants. These were repaired; the final complete run above passes. Initial logs remain for transparency. A premature final launch during dependency restoration did not execute tests; dependencies were restored before the successful full run.

Reproduction: `PLAYWRIGHT_PORT=3212 PLAYWRIGHT_PRODUCTION=1 MAXPRO_EVIDENCE_ROOT=artifacts/phase12/regression PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=<installed Chromium headless shell> caffeinate -i -s pnpm --dir apps/web test:e2e --timeout=60000 --trace=off`, with `next start --hostname 127.0.0.1 --port 3212` serving the Webpack build. `MARKETING_BASE_URL=http://127.0.0.1:3212 MAXPRO_WIDTHS=1440,1280,1024,768,375,320 node scripts/website-polish-evidence.cjs after` generates the final public matrix. `python3 scripts/website-polish-sheets.py` produces the review sheets. The pre-existing user development server was left running; the owned production QA server is stopped at handoff.

## Remaining owner decisions

Final MaxPro/AqarPro name and logo approval; final commercial prices/quotas/tax/terms; professional Arabic editorial completion and native-speaker approval; approved production origin and photography rights. Live authentication, Frappe/backend, provider agreements, AI, payments, messaging and tenant authorization remain separately governed future work. No new product-scope conflict was identified.

No user-testing participants were available in this session; no participant results are claimed. Chromium desktop/mobile emulation does not establish physical-device, Safari or Firefox approval.
