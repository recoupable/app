# Sites MVP

- `/sites`: sites for the selected personal/organization workspace, optionally filtered by artist.
- `/sites/new`: saved brief, HTTPS music link, public artwork/audio uploads, and first generation.
- `/sites/[id]`: desktop/mobile preview, prompt revisions, publish/unpublish, and fan-email export.
- `/s/[id]`: public published snapshot with audio playback, outbound music link, and opt-in email signup.

## Deployment

Requires database migration `20260918010000_sites.sql` (database PR #71), `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and the existing AI Gateway credentials. `SITES_MODEL` optionally overrides the app's default model.

Generated designs use three responsive layouts and structured copy/color/type settings. They do not execute arbitrary generated JavaScript. Spotify links open Spotify; Spotify account login/actions, pre-saves, games, custom domains, and separate Vercel deployments are outside this first version.

Uploads are public assets, limited to 4 MB per file so they fit the hosting platform's request limit. Images are re-encoded to WebP. The first image is the cover; remaining images form a gallery. Uploaded audio uses native browser playback. Email signup records explicit consent but does not send email or subscribe fans to an external mailing platform.

## Access and publication

Server routes verify the caller with the existing account API and check organization membership. Database tables are service-role-only. Saving a generated draft never changes the live snapshot. Publication and revisions use a revision number to reject concurrent stale updates.

## Checks

Run `pnpm exec vitest run lib/sites components/Sidebar/__tests__/SecondaryNav.test.tsx` for offline tests.

The two live tests require explicit opt-in and environment credentials:

- `SITES_LIVE_TEST=1`: invokes the configured generation model using a fictional brief and spends model credits.
- `SITES_DB_TEST=1`: creates a disposable account/site, verifies draft/public/signup behavior and anonymous restrictions, then removes its records.

Both flags are off by default. Load `.env.local` with Node's `--env-file` when running live tests locally.
