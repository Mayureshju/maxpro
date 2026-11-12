# Spec — Gemini-aligned Real Estate Operating System (prototype)

## Canonical property and publishing
- GIVEN an existing demo listing, WHEN the user edits bilingual titles, commercial values, location, permit or owner review, THEN the browser-local draft is stored and the next destination preflight uses those values.
- GIVEN a selected destination, WHEN its sample mandatory fields are missing, THEN it is marked blocked independently, with actionable missing fields. No external publish event occurs.
- GIVEN a destination without local demo preparation, WHEN the user simulates dispatch, THEN its attempt is recorded as `blocked-demo` with the setup reason.
- GIVEN a prepared destination and sufficient fictional fields, WHEN the user explicitly approves and submits a simulation, THEN a `queued-demo` record appears in the browser-local job ledger. It must never be labeled accepted/live.
- GIVEN a Starter plan, WHEN more than 1 destination is selected, THEN continuation is disabled with a clear quota reason; Pro allows 2; Agency selection is unrestricted in this sample, while real partner entitlement remains separate.

## Provider catalogue
- Users can filter providers by category, open named provider detail, see prerequisites and toggle **local demo preparation** with explicit acknowledgement.
- XML, JSON and CSV sample payloads are distinguishable from an actual hosted feed. Feed keys displayed are fake labels; no API credential accepted in browser.

## Lead operations and analytics
- Users can preview round-robin assignment, configure eligible agents and fallback owner, and see that the result is not persisted to a lead database.
- Users can create local viewing requests; status remains `Requested (local)`, never confirmed externally.
- Channel cost/lead/ROI screen can filter sample source and period without implying real attribution or marketing API spend.

## UX, safety and scope
- Every navigable route has a page title, meaningful local or explicitly conceptual behavior, and truthful state captions.
- The public property marketplace is a distinct secondary route group; agency OS is the primary product.
- Real payment, ads, AI, WhatsApp, property portal or Google calls require later backend changes, credentials, permissions and approval.
- Arabic UX needs LTR/RTL checks, translation completion and human review before Gate A acceptance.
