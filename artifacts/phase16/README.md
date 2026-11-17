# Actual application evidence

All images are genuine Chromium captures of the running Next.js app. Baseline uses the pre-implementation local development app. Final captures use the webpack production build on localhost:3216. No generated mockups are used.

| Surface | Before, English 1440px | After, matching default records |
| --- | --- | --- |
| Dashboard | [Before](before/en-1440-dashboard.png) | [After](after/en-1440-canonical-dashboard.png) |
| Empty dashboard | [Before](before/en-1440-dashboard-empty.png) | [After](after/en-1440-dashboard-empty.png) |
| Empty inventory | [Before](before/en-1440-inventory-empty.png) | [After](after/en-1440-inventory-empty.png) |
| Populated inventory | [Before](before/en-1440-inventory-populated.png) | [After](after/en-1440-canonical-inventory.png) |
| Property | [Before](before/en-1440-property.png) | [After](after/en-1440-canonical-property.png) |
| Assistance / new global Copilot | [Existing inspector](before/en-1440-assistance.png) | [Global Copilot](after/en-1440-canonical-copilot.png) |
| New AI Property Launch | [Existing distribution workflow](before/en-1440-publish.png) | [Integrated launch](after/en-1440-canonical-launch.png), [proposal](after/en-1440-launch-proposal.png) |
| Publish & Promote | [Before](before/en-1440-publish.png) | [After](after/en-1440-canonical-publish.png) |
| Campaign preparation/review | [Before](before/en-1440-campaign-review.png) | [After](after/en-1440-canonical-campaign-review.png), [saved campaign fixture](after/en-1440-campaign-review.png) |
| Leads | [Before](before/en-1440-leads.png) | [After](after/en-1440-canonical-leads.png) |
| Inbox | [Before](before/en-1440-inbox.png) | [After](after/en-1440-canonical-inbox.png) |
| Arabic phone | [Inventory before](before/ar-375-inventory.png) | [Inventory](after/ar-375-canonical-inventory.png), [Copilot](after/ar-375-canonical-copilot.png), [launch](after/ar-375-canonical-launch.png) |

`after/{en,ar}-{320,375,768,1024,1280,1440}-*.png` is the established-agency width matrix with 25 properties, enquiries and independent channel/campaign histories. `canonical-*` uses the same built-in sample records as the baseline. Empty captures use the actual registration workflow. `canonical-metrics.json` records geometry and overflow; `{en,ar}-accessibility.json` records whole-document WCAG 2.2 AA checks of inventory, launch and the open Copilot at six widths.

Reproduction: build with `pnpm --dir apps/web build --webpack`, serve on port 3216, then `node scripts/ai-launch-evidence.cjs`. The width/interaction tests are in `apps/web/tests/e2e/ai-launch.spec.ts`. Browser executable can be supplied through `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`; the local default is documented in the script.

Verification commands, actual results and remaining production gates are recorded in `docs/37-ai-property-launch.md`. Early failed/interrupted logs are retained as such; they are not final passing evidence.

Final acceptance: **1,078 passed, 42 expected skips, zero failures** in [playwright-final.log](playwright-final.log). The final new six-width accessibility matrix has 36 scans and zero axe violations. Default Turbopack hit the documented host restriction; the supported webpack production build passed.
