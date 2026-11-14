# Phase 9 — agency productivity and design system

Frontend-only milestone on `7a7bb13c1cb48c24b42a0a0156b2c2f6d07701c5`, preserving the subsequent `4539de1` logo change. OpenSpec: [0013](../openspec/changes/0013-agency-productivity-design/proposal.md). The unrelated pre-existing `artifacts/logo-replacement/` directory was left alone. No backend, Frappe implementation, authentication, external integration, payment or live AI was added. No commit, push or deployment was performed.

## Design decisions and implementation

The four passes retain the stone/eucalyptus system and existing `px-*` / `gm-*` primitives. Shared workspace values now define navigation widths, header height, gutters, content/form widths, spacing, control height, typography, borders, radii, focus, shadows and status colors. Primary responsive boundaries are 1024px for the overlay drawer, 768px for stacked task layouts, and 650px for compact mobile controls. Page gutters are 32/24/16px. Standard content and forms use 14px text; mobile inputs use 16px to avoid focus zoom.

1. **Navigation:** six agency sections; 248px expanded / 72px collapsed desktop navigation, browser-local UI preference, active icons, hover/focus labels, logical RTL placement and reduced motion. Tablet/mobile navigation has a backdrop, focus entry/trap, Escape, focus restoration and inert background. A single 64px sticky header shows contextual linked breadcrumbs, agency identity, language, notifications and profile/settings. Nested property paths resolve the canonical title and action; the language switch retains query context. Super Admin remains outside agency navigation.
2. **Properties:** the four-step editor groups facts in two desktop columns and one mobile column. Source notes, bilingual copy and media ordering offer optional contextual assistance before the dedicated assistance step. The gallery identifies the cover, category, order and missing media; advanced controls are disclosed in the guided editor. Existing standalone media tools retain their operational controls. The form has its own scrolling area, with a reserved action dock outside it, safe-area padding, short-viewport focus handling and visible save/conflict feedback. Browser-local saves, optimistic revisions and unsaved protection remain.
3. **Honest readiness:** eleven named content checks measure completeness independently of human review. Missing content opens the corresponding step and field. Qatar Living, Property Finder and Bayut/Dubizzle display their own example blockers, configuration and review state. Complete content cannot imply approval, legal verification, a prepared connector or provider acceptance.
4. **Property operations:** the overview brings the image, price, review state and next useful action together. Secondary editing/assistance/enquiry links remain close by. Operations, listing details and recent activity use keyboard-accessible tabs. Channel status derives from the latest existing publishing record per destination, campaign records and separately versioned sharing history; the complete history is retained.
5. **Publish & Promote:** select the property, choose portals / paid advertising / direct sharing, then reveal only relevant providers. Multiple portal selections have separate previews, setup, validation, approvals and local outcomes. Campaigns retain their budget, fee and ordered approval engine. WhatsApp messaging stays separate from a paid click-to-WhatsApp campaign. Switching goals or deselecting a channel preserves its unsaved work in the current session; changing properties or leaving with edits invokes the existing discard guard. Outcomes and return links keep the selected property context.
6. **Assistance:** one reusable native modal inspector serves property facts/copy/media, portal copy/blockers, ad copy/creative, direct message copy and lead replies. It displays a deterministic local-demo label, actual source facts, before/after values, optional editing, Accept and Dismiss. Source fingerprints invalidate stale proposals, including cross-tab canonical edits. Accepting a lead proposal fills the composer only. Canonical copy acceptance invalidates human review. The existing deterministic engines remain the only suggestion source.
7. **Daily work:** the dashboard prioritizes an unassigned/new enquiry or unfinished draft, keeps totals compact and avoids stretching empty panels. Settings uses distinct icons and organized rows; demo utilities remain disclosed. CRM gains quick filters, Arabic title search, row reply links and a nearby property link in conversations, while preserving assignment, consent, follow-up and viewing commands. A duplicate React key in the existing channel mapping table was corrected after browser regression exposed it.

## Requirement coverage

| Requirements | Frontend evidence |
| --- | --- |
| GEM-01, GEM-18/19, GEM-22 | Agency context, persistent navigation preference, role/plan guards preserved, accessible responsive shell |
| GEM-02–05 | Canonical editor, media, independent content/review/channel summaries and revision checks |
| GEM-06–08, GEM-10/11, GEM-13/14/16 | Progressive provider preparation, separate campaign/message engines, truthful local histories and property return |
| GEM-03, GEM-21 | Bilingual source-grounded assistance with explicit acceptance and stale-source rejection |
| GEM-12, GEM-15, GEM-24 | Consent-aware measurement, viewing commands and recorded attribution preserved; no invented performance or collection |
| GEM-17/20/23 | Showcase retained; platform tools isolated; production backend remains unimplemented |

## Real browser screenshots

All originals are captures of the running Next.js app. Before captures came from this checkout before implementation; the two before-assistance captures were preserved from the saved Phase 8 evidence in Git. Intermediate pass captures informed the subsequent pass. Final screenshots use the verified Webpack production build, English/Arabic, desktop/mobile Chromium emulation.

| Screen | Before | After |
| --- | --- | --- |
| Agency dashboard | [1440px](../artifacts/phase9/before/1440-dashboard.png) | [1440px](../artifacts/phase9/after/en-1440-dashboard.png) |
| Property inventory | [1440px](../artifacts/phase9/before/1440-inventory.png) | [1440px](../artifacts/phase9/after/en-1440-inventory.png) |
| Guided property editor | [375px](../artifacts/phase9/before/375-editor.png) | [375px](../artifacts/phase9/after/en-375-editor.png) |
| Assistance | [Phase 8](../artifacts/phase9/before/en-1440-assistance.png) | [Inspector](../artifacts/phase9/after/en-1440-assistance.png) |
| Property overview | [1440px](../artifacts/phase9/before/1440-property.png) | [1440px](../artifacts/phase9/after/en-1440-property.png) |
| Publish & Promote | [375px](../artifacts/phase9/before/375-publishing.png) | [375px](../artifacts/phase9/after/en-375-publishing.png) |
| Channel configuration | [1440px](../artifacts/phase9/before/1440-channels.png) | [1440px](../artifacts/phase9/after/en-1440-channels.png) |
| Leads & Inbox | [1440px](../artifacts/phase9/before/1440-leads.png) | [1440px](../artifacts/phase9/after/en-1440-leads.png) |
| Campaign management | [1440px](../artifacts/phase9/before/1440-campaigns.png) | [1440px](../artifacts/phase9/after/en-1440-campaigns.png) |
| Settings | [1440px](../artifacts/phase9/before/1440-settings.png) | [1440px](../artifacts/phase9/after/en-1440-settings.png) |

`artifacts/phase9/after/{en,ar}-{1440,1024,768,375}-*.png` is the ten-screen matrix. Interaction evidence includes [collapsed navigation](../artifacts/phase9/after/chromium-en-collapsed.png), [scrolled mobile form](../artifacts/phase9/after/mobile-chromium-en-scrolled-form.png), [Arabic stale proposal](../artifacts/phase9/after/chromium-ar-stale-assistance.png) and [multiple portal preparation](../artifacts/phase9/after/mobile-chromium-en-multiple-portals.png). The editor captures its viewport-sized scrolling workspace; scrolled captures show the later fields above the reserved dock.

## Actual verification

| Command / check | Result |
| --- | --- |
| `CI=true pnpm install --frozen-lockfile` | Passed; lockfile unchanged. Package-manager policy still skips the existing `@parcel/watcher` / `@swc/core` install scripts. [Log](../artifacts/phase9/install.log) |
| `pnpm typecheck` | Passed. [Log](../artifacts/phase9/typecheck.log) |
| `pnpm lint` | Passed. [Log](../artifacts/phase9/lint.log) |
| `pnpm build` | Failed at the recorded sandbox limitation: Turbopack/PostCSS process cannot bind a local port (`Operation not permitted`). [Log](../artifacts/phase9/build-default.log) |
| `pnpm --dir apps/web build --webpack` | Passed; supported Next.js fallback, unchanged dependencies/framework. [Log](../artifacts/phase9/build-webpack.log) |
| `pnpm --dir apps/web test:e2e` | Final production run in progress; results will be recorded before handoff. [Log](../artifacts/phase9/playwright-final.log) |

The full run uses `PLAYWRIGHT_PRODUCTION=1 PLAYWRIGHT_PORT=3100 PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' MAXPRO_EVIDENCE_ROOT=artifacts/phase9`. Existing domain assertions are preserved. The initial production run found the breadcrumb lookup incorrectly accepting an inherited property key such as `toString`; the header now uses the existing guarded canonical lookup. Lifecycle tests also open the new Listing details tab before its media action. All eight affected EN/AR desktop/mobile journeys passed their focused recheck before the final run. The agency journey tests now choose the goal before a provider, open advanced media disclosure explicitly, and use the shared Dismiss action. Evidence is redirected into this phase rather than overwriting Phase 8 screenshots.

New acceptance tests cover collapsed persistence and focus tooltips, mobile drawer focus/close/backdrop, sticky context and dock geometry, reduced viewport height with long forms, saved drafts, direct missing-field navigation, content versus review/configuration, proposal edit/dismiss/accept/cross-tab invalidation, multiple independent portal queues, truthful property return, paid-ad versus messaging controls, goal-switch draft retention and property-switch discard protection. The final matrix checks overflow at all four widths in both locales. Existing route, accessibility, CRM, campaign, organization and lifecycle regression suites are retained.

## Remaining design and review issues

- Arabic interface coverage is expanded but still needs professional completion and native-speaker review. Source-provided names, locations and some advanced runtime labels remain English; labelled-note extraction still recognizes explicit English labels only.
- The short-viewport check emulates keyboard space by resizing Chromium. Physical iOS/Android keyboards, Safari, Firefox and assistive-technology UAT were not run. Generated local screenshots do not replace user design sign-off.
- Eleven content checks describe the prototype's content coverage, not a legal or universal readiness score. Provider rules/access, secure file storage, authentication, real approvals, external delivery, analytics and spend remain outside this frontend milestone.
- The independent second-tool review required by [AGENTS.md](../AGENTS.md) remains pending: “One tool authors, one reviews; never let different assistants invent independent product scope.” Automatic approval review rejected a read-only Claude Code invocation because it would transmit repository source/design files to an external service without explicit user authorization. The invocation did not run. Local code/diff checks, browser regressions and screenshot inspection continue; they are not represented as independent external review. User approval is needed specifically for that external code disclosure, not for deployment.
