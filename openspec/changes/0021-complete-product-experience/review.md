# Separate review pass

Reviewed the final source diff, public/private imports, original command boundaries and actual browser interactions after implementation. Authoring used source edits; verification used TypeScript/ESLint, a read-only source audit and Playwright. This is not independent participant research or external security sign-off.

Confirmed by [source audit](../../../artifacts/phase17/source-review.json): no canonical, publishing, campaign, CRM, organization or Copilot engine changes; no dependency/lockfile change; no removed routes; public assistance and the shared frame import no workspace repository/provider. Existing property proposal inspector remains the sole explicit copy acceptance path.

Findings repaired:

1. Short public assistant could tab beyond the dialog. Added explicit wrap at first/last visible focusable controls and tested forward Tab, Escape and return focus.
2. A private-record public question matched generic onboarding. Added public-only recovery for private IDs, credentials and action requests, without querying saved state.
3. Persisted copy answers could otherwise be mistaken for a fresh source after navigation. Each answer retains its property revision; a changed source disables proposal review until another question. The inspector independently rejects cross-tab source changes.
4. Fixed-height positioning could intercept editor Continue. The launcher measures visible controls at logical inline-end and moves vertically to a clear location after route, scroll and resize changes. The original EN/AR landlord creation journeys and new table-action clearance checks are regression gates.
5. Desktop table padding was overriding mobile enquiry-card spacing. Scoped the mobile cell reset and retained all source/property/status/assignee/next-action information.
6. Historical screenshot tests wrote into prior evidence trees. Updated the two remaining fixed evidence roots; restored accidentally regenerated Phase 16 files from the original clean baseline.

7. At 200% CSS zoom, physical collision coordinates were being written as unscaled CSS offsets. Convert by the measured element scale and constrain modal height. Close control and input now have explicit viewport assertions.

Intermediate runs retain their actual failures. One production run was invalidated by rebuilding while its server was active, creating stale chunk failures; it is explicitly not acceptance evidence. Final acceptance uses a restarted server and frozen production output, recorded in `artifacts/phase17/playwright-acceptance.log`. No source edits or rebuilds may occur during that final run.

Review limits: native Arabic editorial approval, physical devices, Safari/Firefox, assistive technology and an independent human usability/security review remain separate prerequisites. Local role selection is not authentication or secure tenant authorization. Production remains Frappe-only and unimplemented.
