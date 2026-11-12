# Product experience specification

## Requirement: navigable complete UI prototype
The UI prototype SHALL expose locale-prefixed routes for the public property experience, advertiser workspace and operations console, with consistent navigation and honest non-production labels.

### Scenario: visitor browses examples
Given a visitor on `/en/properties`, when they search or change purpose, the example property set updates locally and each property opens its detail record without claiming availability is live.

### Scenario: advertiser edits inventory
Given a user on `/en/workspace/inventory`, when they filter by status or switch grid/list view, only matching local examples appear. When they open an existing record, they can see its detail, media, publishing and enquiries sections.

### Scenario: assisted listing creation
Given the Listing Studio, when the user selects sample text, proceeds through the six stages and checks approval, the interface can show a local demo completion state. It SHALL NOT claim that a real AI model, portal or backend has been invoked.

### Scenario: agent follows up
Given the inbox, when a person selects a conversation and writes a reply, it appears locally with clear demo status. No real WhatsApp message is sent.

### Scenario: marketing approval
Given the campaign builder, when spend and text are entered, a local approval request can be demonstrated. It SHALL NOT submit an ad or debit a customer.

### Scenario: RTL layout
Given `/ar/...`, the application SHALL render RTL from the root. Remaining unlocalized copy SHALL be tracked as incomplete rather than marked as fully bilingual.
