# Design foundation specification

## ADDED Requirements

### Requirement: Bilingual route structure
The system SHALL render the marketing and agency UI at `/en` and `/ar` paths and set correct document language and writing direction.

#### Scenario: Navigate to Arabic workspace
- **WHEN** a user opens `/ar/workspace`
- **THEN** the page renders Arabic navigation and `<html lang="ar" dir="rtl">`

#### Scenario: Preserve context across locale switch
- **WHEN** a user switches from `/en/pricing?source=demo` to Arabic
- **THEN** the destination is `/ar/pricing?source=demo`, preserving the query

### Requirement: Consistent semantic design
All public and workspace screens SHALL use centralized semantic color, spacing and radius tokens and compatible shared primitives rather than independently copied styles.

#### Scenario: Change primary color
- **WHEN** the design token `--primary` changes
- **THEN** all primary CTA/active states update without page-by-page edits

### Requirement: Transparent demo states
The UI SHALL explicitly distinguish working navigation from missing backend/external integrations.

#### Scenario: Attempt to publish without an API
- **WHEN** a user opens the Portal Hub in this UI-only starter
- **THEN** mock statuses are labelled, and no action claims that a real portal received a listing

### Requirement: Responsive and keyboard accessible
Core public and agency routes SHALL remain navigable at 375px/768px/1440px, with visible focus indicators and no unintended horizontal overflow.

#### Scenario: Keyboard navigation
- **WHEN** a keyboard-only visitor navigates top links and workspace pages
- **THEN** actionable controls expose visible focus styles and descriptive accessible names
