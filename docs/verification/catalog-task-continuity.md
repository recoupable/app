# Catalog report to weekly-task continuity — 2026-10-25

The report CTA carries the viewed `catalogId` to `/setup/tasks`. An explicit
catalog, including an empty or duplicate parameter, never mounts `FirstTaskStep`.
The separate guard re-reads the authenticated account's catalogs through the
existing authorized endpoint and checks the returned owner against the current
workspace. Unknown/removed catalogs, stale workspace selection, sign-out and
read errors never fall back to the first catalog or selected artist. Retry only
repeats the access read. Direct `/setup/tasks` without a catalog retains its
existing setup behavior.

## Deliberately unavailable executor

Every authorized catalog-specific request currently shows an unavailable state.
`Catalog` has an owner, not a designated artist. Song rows have linked artist
account IDs, but neither a partial page nor even one matching artist proves the
intended report scope. The current weekly prompt discovers an artist's whole
Spotify discography; `catalogName` is descriptive text. Task creation requires
`artist_account_id` and does not accept `catalog_id`. Assigning a catalog owner
or the unrelated selected artist would misidentify the task. Even a single-artist
catalog need not contain that artist's complete discography.

This successor therefore changes no task enrollment, scheduling, credit policy,
provider execution, confirmation or auto-run permission. It does not add an
artist picker that could imply a whole-catalog report. A future separately adopted
contract must decide whole-catalog reporting versus an explicitly selected artist
subset, bind the same authorized identity at preview and confirmation, and keep
measurement/report membership within that scope. The current prompt and scheduler
are unchanged.

## Verification and limits

Focused tests cover preserved navigation, direct setup, explicit malformed and
duplicate inputs, second-catalog selection, missing/foreign/removed IDs, current
organization ownership, account changes with an old in-flight response, changed
catalog selection, read errors and retry. The explicit-catalog route never mounts
the mocked pre-run component. No report or task is created by these fixtures.

Native local acceptance uses the actual CTA, guard, hook and Sky CSS with synthetic
identity/catalog-read adapters. It verifies second-catalog navigation, unavailable
copy, wrong-account refusal and access-read error/retry. This is not authenticated
hosted acceptance or a real task/provider operation. Report count/paging, header,
empty-catalog guidance and per-track coverage are outside this change.
