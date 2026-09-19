# Sites MVP

- `/sites`: sites for the selected personal/organization workspace, optionally filtered by artist.
- `/sites/new`: saved brief, HTTPS music link, public artwork/audio uploads, and first generation.
- `/sites/[id]`: desktop/mobile preview, prompt revisions, publish/unpublish, and fan-email export.
- `/s/[id]`: public published snapshot with audio playback, outbound music link, and opt-in email signup.

## Deployment

Requires database migration `20260918010000_sites.sql` (database PR #71), `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and the existing AI Gateway credentials. `SITES_MODEL` optionally overrides the app's default model.

Legacy designs use three responsive layouts. New generations support interactive experiences and a trusted Spotify connection/player as described below. Pre-save scheduling, custom domains, Apple Music authorization, and separate Vercel deployments are not implemented.

Uploads are public assets, limited to 4 MB per file so they fit the hosting platform's request limit. Images are re-encoded to WebP. The first image is the cover; remaining images form a gallery. Uploaded audio uses native browser playback. Email signup records explicit consent but does not send email or subscribe fans to an external mailing platform.

## Access and publication

Server routes verify the caller with the existing account API and check organization membership. Database tables are service-role-only. Saving a generated draft never changes the live snapshot. Publication and revisions use a revision number to reject concurrent stale updates.

## Checks

Run `pnpm exec vitest run lib/sites components/Sidebar/__tests__/SecondaryNav.test.tsx` for offline tests.

The two live tests require explicit opt-in and environment credentials:

- `SITES_LIVE_TEST=1`: invokes the configured generation model using a fictional brief and spends model credits.
- `SITES_DB_TEST=1`: creates a disposable account/site, verifies draft/public/signup behavior and anonymous restrictions, then removes its records.

Both flags are off by default. Load `.env.local` with Node's `--env-file` when running live tests locally.

## Interactive experiences (Sites v2)

New generations produce a complete HTML/CSS/vanilla-JavaScript experience, including actual game mechanics when requested. Existing three-layout snapshots still render. Generated JavaScript is parsed before saving; invalid syntax leaves the existing draft intact. Manual gameplay review is still required before publishing; syntax checks do not prove that a generated game is fun or correct.

Generated code runs in a nested iframe with `sandbox="allow-scripts"`, no same-origin permission, no forms, no network requests, and no access to Recoup or Spotify sessions. Trusted Spotify and email controls are outside that frame. The preview runs the same game but does not connect Spotify. The generated game remains playable without streaming.

### Spotify fan connection

Set `SITES_SPOTIFY_CLIENT_ID` and `SITES_SPOTIFY_REDIRECT_URI`. Register the exact redirect URI in the Spotify developer dashboard. The callback route is `/s/spotify/callback`; use an HTTPS production origin or an explicitly registered loopback development origin. The published page must use the same origin as the callback.

The public client ID is exposed through `/api/sites/spotify/config`. The fan flow uses authorization code + PKCE with a ten-minute state/verifier, validates state before exchanging the code, and removes the callback code from the address bar. No client secret is used. Tokens are scoped to the browser tab session and never passed to generated code. Disconnect clears the local session and stops the player; revoking the application grant itself is done in Spotify account settings. Email marketing signup remains separate and requires consent.

The trusted Web Playback SDK control plays the supplied Spotify track/album/playlist on a user click. Browser playback requires Spotify Premium and a Spotify application with access for that fan. Developer-app access and registered redirects must be verified against the actual Spotify application before calling this production-ready. Missing configuration, cancellation, expired sessions, unsupported music links, and SDK errors are surfaced in the player status.

References: https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow and https://developer.spotify.com/documentation/web-playback-sdk.

### Spotify release blocker

As checked on September 18, 2026, Spotify Developer Policy section III.2 prohibits creating a game with its platform. Do not treat this OAuth/player implementation as approval to launch a Spotify-integrated game. The game can use artist-supplied audio independently; Spotify application configuration and the permitted product integration remain unresolved. The player displays Spotify track metadata and artwork when playback state is available.
