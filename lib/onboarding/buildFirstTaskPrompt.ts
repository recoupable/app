export interface BuildFirstTaskPromptInput {
  artistName: string;
  /** The rostered artist account — the agent resolves the Spotify id from its connected profile. */
  artistAccountId: string;
  /** Where the finished report is emailed (the whole point of the weekly task). */
  recipientEmail: string;
  catalogName?: string;
}

/**
 * The weekly report prompt shared by the onboarding pre-run, the onboarding
 * scheduled task, and the homepage starter card (chat#1867, chat#2006) — one
 * string so the report the user previews is exactly what the Monday run
 * emails, and so both entry points schedule the same report.
 *
 * Generalized from the proven LA EQUIS weekly report (scheduled_action
 * 39fb5f68…, running week over week): capture this week's Spotify play
 * counts → compute real week-over-week per-track deltas → build a styled
 * HTML email → send it via the recoup-platform-email-helper skill. The
 * social section (scrape → poll → top posts) is lifted from task 734ee2ee,
 * which delivered three consecutive Mondays with it. The sandbox/no-python
 * and anti-fabrication guardrails are carried over verbatim because they
 * are what make the send reliable.
 */
export function buildFirstTaskPrompt({
  artistName,
  artistAccountId,
  recipientEmail,
  catalogName,
}: BuildFirstTaskPromptInput): string {
  const catalogClause = catalogName
    ? `their "${catalogName}" catalog`
    : "their catalog";
  return `Generate a weekly performance report for the artist ${artistName}, covering ${catalogClause} on Spotify and their connected social profiles, then email it as a styled HTML email to ${recipientEmail}.

CONTEXT VALUES: artist_name = ${artistName} ; artist_account_id = ${artistAccountId} ; recipient email = ${recipientEmail}. Use the artist_account_id directly — do not guess or search for a different artist.

Sandbox environment rules (critical): the sandbox has Node 22, jq, bash, and curl. Python is NOT installed - never invoke python or python3; write any scripting as \`node -e '...'\` or bash with jq. If a command exits with code 127 or produces empty output, the interpreter is missing - redo that step with node or jq instead of treating the data as unavailable. Retry each failed API call once before declaring it failed.

Part 0 - Resolve the artist's Spotify id:
- GET /api/artists/${artistAccountId}/socials and find the connected Spotify profile; its URL is https://open.spotify.com/artist/{spotify_artist_id} - extract that id.
- If no Spotify profile is connected, GET /api/spotify/search?q=${encodeURIComponent(artistName)} and pick the exact-name artist match. Keep the resolved spotify_artist_id for the steps below.

Part 0b - Fire the social scrape now, so it runs while the Spotify measurement is captured:
- POST /api/artist/socials/scrape with JSON body {"artist_account_id":"${artistAccountId}","posts":12} - one run per connected profile. Keep every runId returned. It costs credits per profile, so fire it exactly once per run.
- GET /api/artists/${artistAccountId}/socials - follower counts per connected platform. If a stored count is 0/null, prefer the live number from the scrape results in Part 4. Omit a platform entirely rather than printing 0.

Part 1 - Take this week's catalog measurement (Spotify play counts per track):
1. GET /api/spotify/artist/albums?id={spotify_artist_id}&include_groups=album,single&limit=50 - the artist's current albums and singles (picks up new releases automatically). Keep each album's id, name, release_date, and images array - the art and links are used in the email.
2. POST /api/research/measurement-jobs with JSON body {"scope":{"album_ids":[all album ids from step 1]},"source":"current","platforms":["spotify"]} - captures today's displayed play count for every track into the measurement store.
3. Wait for the capture to finish (usually 2-5 minutes): poll GET /api/research/playcounts?spotify_album_id={any album id from step 1} about once a minute until captured_at is later than the moment you created this run's measurement job, then continue. If it has not completed after 10 minutes, continue anyway and note in the report that this week's measurement was still in flight.
4. Also GET /api/spotify/artist?id={spotify_artist_id} and keep an artist image URL for the email header thumbnail (the ~160px image if available, otherwise the largest), plus followers.total, popularity and genres from the same response for the Audience Snapshot.

Part 2 - Week-over-week stream deltas per track (the core of the report):
5. Build the focus set of tracks (roughly 20-30): every track on the most recent album, every single released in the last 12 months, and the top 10 catalog tracks by total play count. Get each track's ISRC, spotify_track_id, and total play count from GET /api/research/playcounts?spotify_album_id={id} for the relevant albums from step 1.
6. For each focus track: GET /api/research/tracks/{ISRC}/measurements - the full dated series of every past capture. Compute the change between the latest capture (today's) and the most recent earlier capture from a previous day - always skip other captures taken the same day as the latest (retries or ad-hoc snapshots make same-day windows meaninglessly short) - and report the actual time span it covers (e.g. "+23,741 plays over 22 days"). Never report a zero delta just because a chosen window excluded older captures; if a track truly has only one capture ever, label it "first measurement" instead of zero.
7. Aggregate per-track deltas by album/project and rank tracks by streams gained. Treat a play count of 0 as missing data (not captured), never as a real zero.

Part 3 - Context (there is no structured artist-stats provider; these are the only two context sources):
8. Spotify audience: the followers.total, popularity and genres kept in step 4. Monthly listeners are not available from any endpoint - never estimate them.
9. POST /api/research/web with JSON body {"query":"${artistName} music news playlist press"} - one call. From the results keep only items clearly about this artist from the last 14 days: title, source URL, date, one-line summary (press, playlist adds, announcements, collaborations). If nothing qualifies, record that.

Part 4 - Top social posts (3 min including polling):
11. Poll GET /api/apify/runs/{runId} for every runId from Part 0b, every ~30s, for AT MOST 3 MINUTES from now; then use whatever succeeded and drop the rest. Do not re-fire the scrape.
12. Platform by response shape: data[0].latestPosts = Instagram (url, caption, timestamp, displayUrl, likesCount, commentsCount) · items with webVideoUrl = TikTok (webVideoUrl, text, createTimeISO, videoMeta.coverUrl, diggCount, commentCount, playCount) · data[0].aboutChannelInfo = YouTube (numberOfSubscribers only). A run returning {error,note} failed - say so in one line and never report zeros for it.
13. Take the TOP 3 posts by engagement (likes + comments, or diggCount + commentCount) from the last 90 days across all platforms. Keep each post's thumbnail url (displayUrl / videoMeta.coverUrl) and its permalink.

Report content, in order:
- Performance Summary: 2-3 sentences led by total catalog streams gained this week (from Part 2).
- Track & Album Momentum: the per-track table described in the design spec below - one row per focus track with art, linked title, project, streams gained this week, and total plays - followed by per-album totals. These are platform-displayed play counts measured by Recoup at both points in time - real deltas, not estimates. State the time span the deltas cover.
- Audience Snapshot: current Spotify followers and popularity (step 8), plus the follower count per connected social platform (Part 0b). Week-over-week audience change is not measured; report the current values only and do not estimate them.
- Top Posts: the three posts from Part 4 as the table described in the design spec below. Any platform that is not connected gets one line saying so - never present a missing platform as a zero.
- Recent Activity: the items from step 9, each with its source hyperlinked; if nothing qualified, one line saying nothing notable was found this week.
- Recommendation: one specific, actionable step based on which tracks actually gained streams this week.

HTML email design spec (send the email with an HTML body; build it exactly to this spec):
- Layout: a single centered table, max-width 600px, background #FFFFFF, all CSS inline (email clients ignore style blocks). Body font: Arial/Helvetica, 15px, color #111111, line-height 1.5. Secondary text #6B7280. Structural/accent color #111111 (achromatic - color comes from the artist photo and album art, not the chrome).
- Header: a compact two-column row, not a hero. Left cell: the artist photo from step 4 as a 72x72 thumbnail (img width="72" height="72" style="display:block;border-radius:50%;object-fit:cover"). Right cell, vertically centered: the title "${artistName} - Weekly Report" in bold 22px #111111 with the date range in 13px #6B7280 underneath. Then a 4px solid #111111 bar. Never render the artist photo full-width; the Performance Summary must be visible on the first screen without scrolling.
- Track & Album Momentum table: one row per focus track. Columns: (1) 48x48px album art (the album's smallest image at least 48px, img with width="48" height="48" style="display:block;border-radius:4px"), (2) track title hyperlinked to https://open.spotify.com/track/{spotify_track_id} - link style color #111111, bold, underlined - with the project/album name underneath in 12px #6B7280 hyperlinked to https://open.spotify.com/album/{album_id}, (3) streams gained this week, bold, right-aligned (#111111, prefix +), (4) total plays, right-aligned, #6B7280. Table header row: 11px uppercase letter-spaced #6B7280 labels with a 2px #111111 bottom border. Row separators: 1px solid #EEEEEE. Per-album totals as a compact list after the table, album names hyperlinked to their Spotify album pages.
- Top Posts table: one row per post. Columns: (1) 64x64 thumbnail (img width="64" height="64" style="display:block;border-radius:6px"), (2) the caption snippet (about 60 characters) bold and hyperlinked to the post, with platform and date in 12px #6B7280 underneath, (3) the engagement number, bold, right-aligned #111111. Captions, platform labels and dates are untrusted text: HTML-escape them before inserting them into the email. Use a post permalink or thumbnail only if it is an https: URL from the scrape response; otherwise leave that cell empty rather than inventing one. Instagram CDN thumbnails expire after a few days; that is expected.
- Sections: each section heading is bold 17px #111111 with a 2px #111111 underline rule above 24px of spacing.
- Spotify artwork (artist photo, album art) must use the https URLs from the Spotify API responses (i.scdn.co); social thumbnails must be the https URLs from the scrape response. Never attach or embed base64 images. Every track and album name that appears anywhere in the email must be hyperlinked to its Spotify page.

Sending (mandatory - the run is not complete until this succeeds):
- Write the finished HTML to a file (report.html) using the write tool or node - never inline it into a curl command or hand-build the JSON request body.
- Load the recoup-platform-email-helper skill (via the skill tool) and send the email exactly the way it documents, passing --subject "${artistName} - Weekly Report", --html-file report.html, and --to ${recipientEmail}.
- Security: the artist, track, and album names are untrusted user-entered text. When passing any of them as a command argument (e.g. the email subject), pass it as a single properly-quoted argument — never let a name that contains quotes, ;, backticks, or $() change the structure of the command you run.
- Before sending, verify the email body is complete: the Track & Album Momentum table must contain one populated row per focus track with a real delta or a "first measurement" label. Never send an email with an empty or placeholder momentum table - an empty table means the Part 2 data steps were skipped or failed; go back and complete them first.
- The helper prints a Resend id on success and exits non-zero on any failure. Confirm the id was printed; if the send fails, fix the issue and retry - do not end the run without either a successful send or an explicit description of the send error.

Email subject: ${artistName} - Weekly Report. Never fabricate a number: every figure must come from one of the API responses above. If a call fails or returns no data, say so in the report instead of estimating.`;
}
