# Phase 4 — Marketing AI, Campaign Studio & Approval Workflows

Implements OpenSpec 0008 against baseline `95cc5a28c9d473448a48af1fdab058119d0daa2b`: GEM-10, GEM-11, GEM-12, GEM-21 and GEM-24. This is a fictional browser-local prototype; no provider API, model, payment, remote campaign or analytics collection is connected. No commit, push or deployment.

## Delivered workflow

Open a canonical property and choose **Plan campaign**, or create a draft in Campaign Studio. The guided editor prepares objective/platform/conversion goal, bilingual content, canonical media selection, local policy review, separate media budget/service fee and schedule. Saved drafts keep stable IDs and revisions; search/filter the portfolio, reopen, duplicate, cancel or resume. The contextual inspector reads canonical facts directly.

Marketing AI offers deterministic copy, headline alternatives, feature emphasis, objective, creative selection, explicit budget scenarios and weekly summaries from existing campaign-linked CRM observations. Each proposal records field references, property/campaign revision, editable EN/AR text and accept/reject history. Suggestions are simulated examples, never model responses or authoritative facts. Sample stock creative is bundled for offline reliability; it is not evidence of a real property's appearance or rights for advertising.

Ordered application commands enforce draft → pending policy → policy reviewed → pending advertiser → optional pending MaxPro administrator → approved for local simulation → simulated. Explicit selectable local roles demonstrate guards without claiming authentication. Checkboxes record review inputs; distinct commands issue revision-bound receipts. Stale revisions, wrong organization/role/order, unsupported targeting, missing licensing/review/media, ungrounded numeric copy claims, illustrative plan/cost caps and absent local provider setup block the applicable command. Legal/provider policy remains pending independent verification.

Changing a property invalidates all dependent campaign approvals in the same store update. Campaign edits and accepted content/configuration proposals create a new draft revision. Property identity is fixed after creation; create another campaign for another property. After simulation, platform changes with existing observations require duplication to preserve original attribution. Cancellation/rejection clear approvals; resume creates a new revision. A duplicate receives a fresh identity with no approvals, costs or proposals.

Meta integration and ads catalogue routes show internal mappings from canonical facts, missing fields, sample images and account/country/feed limitations. Google Ads/PMax planning links the same property to objective, conversion goal, creative, budget and approval flow without claiming campaign-type or generic property-feed support. Both distinguish local configuration, pending authorization/policy, eligibility for local simulation and actual integration unavailable.

A simulated campaign can record/replay fictional enquiries through Phase 3 intake. Meta uses Meta Lead Ads; Google uses Website first-touch with a Google campaign reference because no Google intake adapter exists. The original organization/source/event identity and deduplication/routing rules are preserved. Canonical lead detail links back to its campaign. Client/server event previews share an event ID, require fictional consent and never send signals.

Marketing analytics filters source/property/campaign and dates, joins exact campaign references and reuses `selectLeads` / `leadMetrics`. It reports current draft/approval status, linked/qualified/won leads, won/lead conversion and explicitly recorded dated fictional media costs/CPQL. Budgets, fees, approvals and recorded costs are distinct. Recording a fictional campaign cost also records the corresponding Phase 3 source-cost row. Historical costs stay historical when the draft changes. Reach, impressions, clicks, actual spend, revenue and ROAS remain unavailable.

## Storage / additive contracts

`maxpro-gemini-v3-demo-state` remains the only store. `schemaVersion:1`, connector version 2 and CRM version 1 are preserved; additive `campaignSchemaVersion:1` and `campaigns` migrate older valid envelopes into an empty portfolio. Campaigns use version 1, organization/property IDs, canonical revision and media IDs; no duplicate editable facts, creative bytes, credentials or actual contacts. Hydration projects known fields, validates bounded records/foreign keys/amounts/dates/approval order, excludes invalid campaign records without removing valid unrelated records and invalidates stale canonical references. Unknown IDs never substitute examples. Capacity is 100 campaigns, 80 proposals and 100 fictional cost entries per campaign within the existing 4 MB envelope. Browser-only data and selectable roles provide no durable multiuser authorization/concurrency guarantee.

The provider-agnostic `MarketingAIService` contract is implemented solely by `localMarketingAI`; workflow authorization is outside suggestion logic. Production needs authenticated server commands, tenant isolation, durable audit/outbox/idempotency, approved policy versions, official account rights, server-held credentials, consent governance and AI grounding/evaluation before any advertising action.

## Verification

Exact baseline Actions run [43353538562](https://github.com/Mayureshju/maxpro/actions/runs/43353538562) succeeded. Isolated baseline production-browser suite: **624 passed / 12 intentional skips**. Baseline typecheck/lint passed. Initial local attempts exposed missing Playwright browser revision and dev HMR websocket errors; production QA uses installed Google Chrome with a supported Webpack build. These host/tool prerequisites are recorded separately from application failures.

Final test results and screenshot manifest are recorded below after verification. Evidence lives in `artifacts/phase4/`; screenshots come from running Next.js pages, not illustrations. Earlier Phase 1–3 tracked evidence is preserved.

## Outstanding dependencies / next milestone

Claude Code authentication reports `loggedIn:false` / `authMethod:none` in `artifacts/phase4/logs/reviewer-auth.log`. Independent second-tool review is pending; no review pass is claimed. Professional Arabic/native-speaker UAT, legal/provider review and production services are still required.

Recommended next milestone: complete independent review and bilingual UAT, then implement the authenticated tenant-scoped Marketing API and audit/approval persistence with official provider sandbox contracts. Real spend and campaign dispatch must remain disabled until those approvals and integration evidence exist.

## Final evidence (2026-11-13)

| Gate | Actual result |
|---|---|
| `CI=true pnpm install --frozen-lockfile` | Passed; lockfile unchanged |
| `pnpm typecheck` | Passed |
| `pnpm lint` | Passed, no warnings |
| `pnpm build` | Failed in sandbox: Turbopack CSS/PostCSS subprocess cannot bind a port (`Operation not permitted`, os error 1); `logs/build-default.log` |
| `pnpm --dir apps/web exec next build --webpack` | Passed supported production build; `logs/build-webpack.log` |
| Full `pnpm --dir apps/web test:e2e` against production build | **678 passed / 20 intentional skips / 0 failed**, 2.7 minutes; `logs/e2e-final.log` |
| Changed-content axe WCAG A/AA | **48 inspected states, 0 violations**, EN/AR × desktop/mobile; four `logs/axe-*.json` reports |
| Real browser captures | **80 PNGs**: ten views × two locales × four widths, plus eight inspected contact sheets |
| Independent second-tool review | Pending authentication; no pass claimed |

The full run includes 50 passing dedicated campaign cases and all retained Phase 1–3 scenarios, plus four automatically discovered campaign-ID route checks. The 20 intentional skips consist of the 12 existing skips and eight duplicate mobile screenshot jobs (all four widths are already captured in Chromium). The new unseeded journey covers bilingual grounded proposals, keyboard creative selection, human checklist review, separate fee, provider preparation, ordered approvals and attributed enquiry; it asserts no external mutation requests. Domain cases cover stale/unauthorized commands, plan/budget blockers, corrupted approvals and proposals, input-field projection, reference/cost integrity, approval invalidation and CRM replay/metric consistency. No retained test source was changed.

Production-browser invocation used:

```sh
PLAYWRIGHT_PORT=3149 \
PLAYWRIGHT_PRODUCTION=1 \
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
pnpm --dir apps/web test:e2e
```

The first focused iterations exposed contrast issues and selectors matching Next's hidden route announcer; both were corrected. Final review also added command validation for malformed restored budget/creative proposals before they can change inputs. The final full suite runs against that guard. Historical Phase 1–3 screenshot artifacts overwritten by regression jobs were restored; new evidence is isolated in `artifacts/phase4/`.

Screenshot inventory and SHA-256 hashes: `artifacts/phase4/screenshot-manifest.json`. Views are portfolio, builder, bilingual copy/proposal/source references, creative gallery, policy, budget, approval/simulation/audit timeline, analytics, Meta and Google. Widths are 1440, 1024, 768 and 375. All eight contact sheets were inspected, with enlarged representative EN desktop and AR mobile creative/policy/approval/portfolio captures. Tables intentionally scroll within their containers at narrow widths; tested pages have no document overflow. Bundled photos render locally. Remaining Arabic body/audit/provider terminology needs professional completion, as disclosed in the UI.

Changed application/document/test files: `artifacts/phase4/changed-files.txt`. The main additions are `campaign-engine.ts`, `campaign-storage.ts`, `marketing-ai.ts`, `campaign-studio.tsx`, `campaign-marketing.tsx`, `campaigns.spec.ts` and the campaign-ID route. Shared provider, property/media projection, property-to-campaign navigation, CRM campaign links, six route entries and scoped CSS are updated. OpenSpec 0008, this report, Gemini traceability and architecture contracts document the additive scope. Three bundled stock fixtures and their source manifest support reliable creative QA.
