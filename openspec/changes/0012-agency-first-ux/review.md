# Independent review record

A separate read-only reviewer checked the authored implementation against OpenSpec 0012 and the supplied phases A–H. The reviewer did not author independent product scope or edit source files.

Findings corrected by the author:

- Stale wizard drafts could be rebased by embedded media updates. Embedded media commands now use the wizard's expected revision.
- Stale advertising forms could overwrite current campaign values. Forms retain their loaded revision and require explicit reload after a conflict.
- Direct preparations changed listing revisions. A guarded, independently versioned sharing subrecord preserves existing listing queues and campaign approvals.
- An agent testing persona disabled its own control. Only the separated demo utility is exempt from the view fieldset; all command guards remain.
- Changed source facts could leave old copy proposals. Source changes clear proposals; ad suggestions also bind their property revision.
- The save-and-publish link conflicted with draft-discard handling. A button now saves successfully before programmatic navigation.
- Landlord/broker entry incorrectly chose the owner persona. Entry now selects the organization-type-appropriate persona.
- Residual verification/diagnostic links exposed platform administration. Links are role-gated and direct non-admin platform routes show a restricted return surface.
- Property status ignored direct preparations. Status/activity include their history and require review after property edits.

The reviewer rechecked stale media, stale campaigns, sharing revisions, persona recovery, proposal invalidation and landlord entry in isolated Chrome sessions. Final narrow re-review confirmed both remaining navigation/status findings were addressed and reported no further concrete defects. Automated regression evidence is recorded in `artifacts/agency-first/verification.md`.
