# Roster dialog acceptance

Continues app #2166 under Mono #349 / #359 / #361. The Skills #349 instruction
repair and published-package acceptance are already complete; these tests do not
reopen that correction or substitute for the remaining hosted journey.

`components/Artists/__tests__/AddArtistDialog.roster.test.tsx` renders the real
roster dialog and Spotify search component, `useAddSpotifyArtist`,
`addSpotifyArtist`, `createRosterArtist` and client API URL helper. Auth, current
workspace, roster/query services, search results, notifications, HTTP responses
and valuation are synthetic boundaries. No customer/provider call is made.

## Covered handoff

- Both HTTP200 reuse and HTTP201 creation send the selected organization's ID
  and exact Spotify identity in the initial POST. The roster refresh receives
  the returned canonical account ID, rather than the Spotify ID.
- A fresh React mount uses the current organization. This is not a fresh hosted
  session or proof of persisted membership.
- The dialog requests closure only after the roster refresh resolves; artist
  selection is disabled while that work is pending.
- Missing authentication prevents HTTP submission. Rejected association and
  refresh failures request an error notification, do not request closure or
  success, and do not fall back to another name-only POST.
- Unloaded catalog data and an existing catalog do not start valuation. Loaded
  empty catalog data starts the existing valuation path through a mock only.

The provider controls whether the dialog is open; the fixture observes its close
callback and retains the dialog for failure checks. Notifications are observed
at the existing toast boundary, not through a native screen-reader/browser run.
Response statuses model the existing API contract; they do not prove database
creation, canonical resolution, authorization or transaction behavior.

## Evidence and limits

Based on app main `3205f565207786696f88b43bb2ffb363f4804006`. These are integration
characterization tests, not a runtime change or a claim that a new product bug
was repaired. Four temporary local fault probes omitted organization forwarding,
selected the Spotify ID instead of the returned account, closed after rejected
adds, and started valuation while catalogs were unloaded. Every variant failed
the new assertions; the original source was restored afterward.

Run the focused checks with:

```sh
pnpm exec vitest run components/Artists/__tests__/AddArtistDialog.roster.test.tsx lib/artists/__tests__/addSpotifyArtist.test.ts components/Onboarding/__tests__/AddArtistForm.test.tsx
```

Hosted request/response and persisted organization membership, concurrent writes,
actual non-admin/revoked membership, reload/new-session continuity, and customer
notification rendering remain separately evidenced acceptance under #2166.
The existing first-artist hook can initiate valuation; this test is not approval
to perform that side effect or any hosted onboarding write. Keep those operations
unapproved until the owning authorized journey is explicitly defined.

## Songwriter/producer artist accounts

The manual form now requires the API's `professional.artist_id` and invalidates
both the professional-role query and the organization's artist query after saving.
The browser test in `manualProfessional.browser.tsx` uses the real form, response
parser, `useArtistsRoster`, and `WorkspaceContextBar`. A synthetic successful POST
makes the account available on GET /api/artists; the picker refreshes without a
page reload and selection receives the account ID, not the professional-record ID.

Deploy after the database account-link migration and API response schema. The
browser suite uses synthetic auth and HTTP; it does not establish hosted deployment.
