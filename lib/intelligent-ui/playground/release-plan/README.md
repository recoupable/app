# Local release planning — #2212

The **Release plan** example is available only with the existing development opt-in
`NEXT_PUBLIC_RECOUP_INTELLIGENT_UI_CHAT=true`. Production cannot mount it, including
production platform flags. It is a separate editor beside the unchanged **Release
readiness** example, not a new core Surface component or Context authority.

Identity (`example-label` / `night-swimming`) and worksheet material claims come from
`releaseProtocolScenario.ts`, fictional delivery worksheet revision 3. The goal,
November 20, 2026 release date, America/New_York zone, and three task offsets are
explicitly authored planning defaults, not dates supplied by that worksheet. The
source is visible in the editor. No private intake or customer data is used.

## Dates, dependencies and review

Dates are ISO Gregorian calendar dates, 1900–2100, with an explicit IANA timezone
(or UTC). They have no time of day or instant. Offset calculations use UTC calendar
fields as a date carrier, never host-local parsing or elapsed 24-hour arithmetic.
Weekends count; changing the timezone does not shift dates. DST does not change the
number of planning days. Task offsets are integers from −365 through 365.

Three known task IDs form a small dependency graph. A date is relative to the
release date or another task's effective date. Unknown/missing/duplicate tasks,
unknown anchors and cycles are rejected, including cycles concealed by manual
values. Manual dates stay fixed and their offset-proposed dates remain visible.
An intentional override may differ from its offset. A preparation task after
release or before its task dependency is a conflict that blocks saving. Clearing a
manual date restores offset calculation; the editor never silently moves it.

The form computes working dates without writing storage. **Review local changes**
captures detached proposed edits and shows changed goal, date, zone, rules, manual
values and resulting task dates. Further input invalidates that review. **Save local
version** is a separate explicit action; saving never marks a task complete or
approved. No-change/repeated saves do not increment the version.

## Local persistence boundary

Only the latest saved version is retained in **sessionStorage**, scoped by fixture
authority, workspace, release ID, worksheet revision, planning fixture revision and
purpose. It survives reload/reopening the example in the same tab until the tab is
closed. Unsaved edits are in memory and discarded when leaving. A duplicated tab
may receive a browser-created copy; thereafter its storage is an independent fork.
This is deliberately not localStorage, account storage or cross-tab coordination.

Read/compare/write is synchronous within this tab's JavaScript task. A changed raw
base or version refuses a stale save. Repeating an already saved proposal returns
its current version. Readback must match before success is shown. The exact source,
strict schema, known tasks, values and bounded 12,000-character record are checked
on restore. Version numbers are bounded to 1–1000; no unbounded history is kept.
Invalid data is not overwritten. Storage failure preserves working edits and a
readable text plan; it does not claim persistence. Explicit reload discards working
edits only when a valid saved version can be read. Keyed fixture changes isolate
state. Creative drafts and selection continuity contracts remain unchanged.

The readable working-copy text includes identity, source revision, base local
version, goal, date, zone, pending tasks and conflicts. Invalid input falls back to
the last valid saved plan or authored defaults, explicitly labeled. Plain text is
selectable without invoking clipboard, model or network actions.

Scheduling, Sites creation, gateway/action dispatch, backend saves, queues, paid
providers, account/auth operations, rights approval, distribution and publication
are unavailable. This editor does not generate assets, execute tasks or represent
an approved operational plan. Release Packs and Sites ownership remain separate.

## Validation and remaining acceptance

Focused tests cover DST transitions, year/leap boundaries, offset bounds,
dependencies, manual conflicts, invalid/cyclic inputs, diffs, stale/duplicate saves,
readback/write failures, invalid storage, scope isolation, remount restoration,
review invalidation, fallback and development gating. Run:

```sh
pnpm exec vitest run lib/intelligent-ui/playground/release-plan components/IntelligentUI/__tests__/ReleasePlan.test.tsx components/IntelligentUI/__tests__/Playground.test.tsx
```

Native keyboard/focus, date-control behavior, small-screen/zoom layout, screen-reader
announcements and real-browser reload/session-storage behavior remain pending. No
browser/CUA, listener, build or deployment is part of this source slice. The Docs
native lease remains held. Root owns final qualification and merge; local tests do
not establish full #2212 acceptance or backend persistence authority.
