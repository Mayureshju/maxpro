# Product experience evidence

Baseline `ad1c4306f43e2133b430c50dc1659897441f9516`, verified equal to freshly fetched origin/main. Local-only implementation; no push or deployment. Audit started 17 November 2026; acceptance completed 18 November (Asia/Calcutta).

[Route audit, persona decisions and journeys](../../docs/38-complete-product-experience.md) · [OpenSpec](../../openspec/changes/0021-complete-product-experience/proposal.md) · [Review findings and repairs](../../openspec/changes/0021-complete-product-experience/review.md) · [Source audit](source-review.json).

## Requested screens

Every image is a real browser render. EN/AR at 1440/1280/1024/768/375/320 are indexed in [before](before/audit.json) and [after](after/audit.json). New launchers have no fictitious before state: their actual baseline is the header Copilot / absence of public assistance.

| Surface | Before | After |
| --- | --- | --- |
| Homepage | [EN desktop](before/en-1440-home.png) | [EN desktop](after/en-1440-home.png), [Arabic phone](after/ar-375-home.png) |
| Product / AI page | [AI page](before/en-1440-ai.png) | [AI page](after/en-1440-ai.png), [Platform](after/en-1440-platform.png) |
| Empty agency | [Welcome](before/en-1440-empty-dashboard.png) | [Welcome](after/en-1440-empty-dashboard.png) |
| Established dashboard | [Desktop](before/en-1440-dashboard.png) | [Desktop](after/en-1440-dashboard.png), [Arabic phone](after/ar-375-dashboard.png) |
| Inventory | [Desktop](before/en-1440-inventory.png) | [Desktop](after/en-1440-inventory.png), [Phone](after/en-375-inventory.png) |
| Property details | [Desktop](before/en-1440-property.png) | [Desktop](after/en-1440-property.png), [Arabic phone](after/ar-375-property.png) |
| AI Property Launch | [Desktop](before/en-1440-launch.png) | [Desktop](after/en-1440-launch.png), [Arabic phone](after/ar-320-launch.png) |
| Assistant closed / open | [Header entry](before/en-1440-dashboard.png), [Old drawer](before/en-1440-assistant-open.png) | [Corner entry](after/en-1440-dashboard.png), [Open panel](after/en-1440-assistant-open.png), [Arabic phone](after/ar-320-assistant-open.png) |
| Public assistant | Absent in baseline | [Public panel](interactions/en-1440-public-assistant.png), [Arabic panel](interactions/ar-375-public-assistant.png) |
| Campaign preparation / approval | [Preparation](before/en-1440-campaign-review.png) | [Preparation](after/en-1440-campaign-review.png), [Actual saved approval workflow](regression/regression/phase4/screenshots/en-1440-approval.png) |
| Leads / Inbox | [Leads](before/en-1440-leads.png), [Inbox](before/en-1440-inbox.png) | [Leads](after/en-1440-leads.png), [Inbox](after/en-1440-inbox.png), [Arabic phone](after/ar-375-inbox.png) |

108 before + 324 after + 36 expanded-assistant screenshots are listed with hashes in [manifest](screenshot-manifest.json). Historical Phase 6–16 artifacts are preserved. The full regression tree contains additional workflow evidence, including quotas, consent, source changes, approvals, local outcomes and recovery.

## Verification

Final full-suite command uses the webpack production output on port 3017, installed Chromium headless shell, both desktop/mobile projects, `--timeout=60000 --trace=off`, and `MAXPRO_EVIDENCE_ROOT=artifacts/phase17/regression`. `caffeinate -i -s` prevents host sleep; it is not an app dependency.

- [Final full acceptance log](playwright-acceptance.log): **1,110 passed, 44 expected skips, zero failures; 1,154 total in 4.4 minutes.**
- [Typecheck](typecheck.log), [lint](lint.log), [default Turbopack sandbox failure](build-default.log), [final webpack production build](build-webpack-final.log).
- New assistant accessibility: [English](interactions/en-accessibility.json), [Arabic](interactions/ar-accessibility.json). Whole-document WCAG A/AA at all six widths in public, editor and Inbox states. Existing suites retain their own accessibility reports.
- [After capture results](visual-final.log), [genuine product refresh](product-refresh-final.log), [source/crop provenance](../../apps/web/public/product/product-provenance.json).
- [12 visual overview sheets](contact-sheets), supplemented by full-resolution source images and expanded-state captures.

Intermediate logs retain real failures and interrupted runs. `playwright-full.log` was invalidated by a rebuild against an active server. `playwright-pre-zoom-fix.log` records the old screenshot assertions and zoom defect. `playwright-before-final-placement.log` is the earlier passing full run. Only `playwright-acceptance.log` verifies the final source, including lower-corner placement refinement.

These are Chromium emulations, automated accessibility checks and evaluator visual reviews. Native Arabic editing, physical devices, Safari/Firefox, native browser zoom and assistive-technology/human usability/security review remain outside the verified evidence. No live AI, provider, account, messaging, billing or production-security capability is claimed.

Reproduce overview sheets and hashes with `python3 scripts/ux-transformation-sheets.py` from the repository root (local Pillow required).
