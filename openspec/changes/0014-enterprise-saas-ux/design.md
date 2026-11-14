# Design and ownership

Keep stone/eucalyptus, brass overlines and the AqarPro logo; MaxPro remains the repository/product working name pending brand approval. One shared page header, 248/72px sidebar, 64px topbar and 32/24/16px logical gutters. Use a 4/8/12/16/24/32 spacing scale, 44px controls and 16px mobile field text. Reserve editor actions outside the scroll area.

Styles have semantic owners: tokens, foundations, layout, shared components, property/promotion, CRM, campaigns, organization, integrations and public compatibility. Consolidate exact repeated declarations after parsing selectors and responsive context; retain required dynamic classes and compatibility styles. Shared field/button/selection rules own appearance. Feature files own composition. No new package is needed.

NativeSelect remains a real select for short lists and compatibility workbenches. Purpose uses a native radio segmented group. SearchCombobox handles portfolios, agency entry and agent assignment with APG input/listbox semantics, manual commitment, active descendant, arrows, Enter, Escape, Tab cancellation, explicit search/selection clearing, disabled options and bounded viewport-positioned scrolling. Popups escape overflow via a portal, align to their field in either direction, and reposition on scroll, viewport and software-keyboard resize. Stable canonical values remain separate from labels/search text.

Existing Intro/Section/Pill, modal assistance and draft protection are consolidated rather than replaced with duplicate state owners. Contextual proposals continue to show sources and changes and require acceptance; changed fingerprints reject stale proposals. Engine commands remain untouched.

One author owns scope and implementation; separate review checks this authored contract and implementation without inventing scope. Browser and static tools verify behavior, imports, dimensions and accessibility. Record unresolved findings honestly.
