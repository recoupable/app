# Local hostile generated-frame qualification

Bounded evidence for recoupable/app#2110, not completion of its shared external-app
release gate. This fixture calls the actual `renderExperience` and
`renderSpotifyPlayer`, and serves unchanged `sites-runtime.js` and
`sites-fan-runtime.js`. Only observation controls are appended outside the shell.
The credential sentinel, game, activity sink, and unconfigured player response
are synthetic. No account, provider, customer activity, purchase, award, or live
endpoint is used. Run from the App repository:

```sh
node scripts/sites/isolation-fixture.mjs
```

Open `http://127.0.0.1:8848/` in the permitted browser. The listener binds only to
loopback. Restart the process for a fresh sink; reload the page after changing
fixture code. All renderer, runtime, stylesheet, playlist and static player asset bytes are read
once at process startup. Compilation, hashing and serving use this frozen cache.
`/evidence` reports source/asset hashes and separate hashes for the rendered shell,
observer harness, final HTML and player response. A temporary-copy regression
mutates every source file after fixture creation and verifies responses and hashes
still match the captured bytes. Keep the process running until the browser test
finishes. Do not navigate to or inspect a browser-generated blocked-frame error
page. Stop on browser-policy denial; do not switch tools or browsers to bypass it.

## Current source permissions, not approval of their sufficiency

- Generated iframe: `sandbox="allow-scripts allow-downloads"`,
  `allow="web-share *"`. No same-origin, forms, popups or top-navigation sandbox
  grants. Downloads and web-share are present permissions, not tested here.
- Child CSP: default none; inline scripts/styles; data images plus declared asset
  origins; media from declared asset origins. Connect, frame, form-action and
  base-uri are none. This asset-free fixture does not qualify media permissions.
- Parent accepts activity, join and finite resize messages only from the exact
  generated iframe. It intentionally accepts opaque-origin messages. Join opens
  the music panel; it does not establish identity or marketing consent.
- Allowed activity names: visit/start/complete once each and replay/share ten
  times each per parent-page load. Extra fields are not forwarded. These are
  client counters, not server rate limits, billing evidence or award authority.
- Generated resize is bounded to 480–12,000 CSS pixels. Trusted player controls
  use a separate window-source and origin check; music resize is 160–560 pixels.

This test does not endorse the existing downloads/web-share allowances or claim
that all ways of navigating the frame itself, loading assets, exhausting CPU,
reloading the host, or requesting join are constrained sufficiently for release.

## Reproduce and assess

1. Before interacting with the game, click **Send wrong-source messages**, then
   **Inspect evidence**. Expect only the initial visit, no 9999px resize and a
   collapsed music panel. These messages come from the parent, not the game.
2. Advance the game twice. Click **Run hostile probes**, then **Inspect evidence**.
   Expect SecurityError for parent DOM/sentinel, parent storage, opaque storage
   and top navigation; fetch rejection; blocked base and nested-frame requests.
   Form submission must leave the top page intact and the escape sink empty.
   Inspect actual browser diagnostics when available; do not infer which of
   overlapping CSP/sandbox rules blocked the form from sink absence alone.
3. Expect exactly 23 activity requests: 1 visit, 1 start, 1 complete, 10 replay,
   10 share. Each body has only id, visitId and event. No escape request reaches
   the sink. Invalid activity/resize messages must not change controls.
4. Click **Request huge resize**, inspect 12000px; click **Request tiny resize**,
   inspect 480px. The ResizeObserver may subsequently report the content size.
5. Open music player. Run hostile probes again: forged music continuation and
   resize messages must not close the panel or set its height to 99999px. Then
   click the real player's **Continue without music**. The panel closes and
   the actual shell leaves the generated game interactive at score 2. Repeated
   probes must not increase the 23-request sink count on that page load.
6. Save AX/DOM observations, screenshots and `/evidence`, including viewport,
   browser identity and source hashes. An empty sink alone is not proof a probe
   executed; pair it with the visible probe report and preserved host state.

## October 26, 2026 local receipt

Source base: `75522f367aa2e885c7360503c2ec757daf69cf8b`. App runtime was not modified.
Browser: Codex IAB (Chromium/CDP surface); exact browser build not exposed in the
captured metadata. Viewport 1422 × 800 CSS pixels. Provider mode: unconfigured,
local config response; no Spotify sign-in. No native permission denial occurred
in this distinct opaque-frame run. The separate #2345 wrong-origin hold remains.

Observed the sequence above: score 2 retained; parent/opaque storage and top
navigation raised SecurityError; fetch rejected; connect-src, frame-src and
base-uri violations appeared in the child report; no form/navigation/frame/fetch
escape reached the local sink. Wrong-source messages and malformed inputs were
ignored. The two 500-message floods yielded 23 total sanitized activity requests.
Both resize bounds and the genuine versus forged music continuation distinction
were observed. Native fixture observations and the focused VM regression are
separate evidence; a VM pass is not browser sandbox proof.

An unattributed browser console error reported a MutationObserver target that was
not a Node. The captured entry contains only a message and timestamp, without a
script URL or stack; its source is unverified. No fixture or production defect
is inferred from that entry. The demonstrated no-music control and probe states
remain the evidence for this bounded receipt; no playback claim is made.

SHA-256 of tested production sources:

| Source                 | SHA-256                                                          |
| ---------------------- | ---------------------------------------------------------------- |
| renderExperience.ts    | 7d53b754047fcb2521a60857a694fb26916f5ee5e28c730c84ce86bd3d49a6d0 |
| renderSpotifyPlayer.ts | 4dbfc90eaa33658d1f077fa9366c0c94e07923ad1ff155ae75f472ece7c5b9e3 |
| sites-runtime.js       | 0416eb02d3aa332f03bed4e73d9b88a06d8028b21fbbccb78b65f6acbe82cc6c |
| sites-fan-runtime.js   | 4b9dd6b849855bd7ec89eef5d03cef5c8f57171788332293333bf336abcb3195 |

Fixture hashes are emitted at startup and retained in the local receipt.
Remaining #2110 gates include reviewed allowed permissions, independent hosting
and registered origins, released shared Fans/Widgets, mobile/provider flows,
server abuse/tenant boundaries, and authorized billing/award tests. This receipt
neither approves policy nor establishes those outcomes.

The final native sequence was repeated after the byte-cache repair. Full AX
snapshots (rather than only diffs) and a fresh sink receipt were saved. Final
fixture SHA-256: `34374d7cfbf05f8c9b14862f0019fafc531c99c113030f52932ffc0ded2ee2dd`;
hostile-game SHA-256: `b1f80c0fc82157ad818456ffc104fee9ffd70836a1c5b775e7278929ec848c97`.
Final HTML response: `b3317ed95490fbe71541e175eba517aeda576680f26f901ef937152e27f662dd`;
player response: `1487b30398d62cb85ed990f8cb9ce17bbfc438788ee4404d97085ad8616c78f6`.
