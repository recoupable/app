# Design Review 02 — Spotify & Web Search tool responses

Senior product-design audit of the Spotify and Search tool-result UI in `components/VercelChat/tools/`. Two lenses per component: **A) Senior designer** (hierarchy, type, spacing, tone, and especially motion/streaming/play affordances) and **B) Customer vs. higher-bar platforms** (Spotify, Apple Music, Perplexity, Linear/Vercel). No component code was changed.

Bar to beat: Spotify's own track rows and album page, Apple Music's hero treatment, Perplexity's source cards (favicon + domain + date + numbered citation + staggered reveal), Linear/Vercel motion polish.

A cross-cutting data finding sits under everything below: **the API already returns `popularity` (0-100) on artists/albums/tracks, `followers.total` on artists, and `preview_url` on tracks (`types/spotify.ts` lines 10-12, 36-39, 157, 199), and none of it reaches the UI.** Most of the "feels generic" critique reduces to this: we have music-product data and render it like a generic link list.

---

## Top 8 summary

1. **P0 — No audio. `preview_url` exists on tracks but is never used.** A music product where you cannot hear a single note feels like a database viewer. Wire a 30s hover/click preview with a play/pause toggle on track rows and cards.
2. **P0 — `popularity` and `followers` are discarded.** These are the one thing that makes a music result feel "live." Render popularity as a small meter/bar and followers as a stat; this is the cheapest path from "chip" to "product."
3. **P0 — Track rows don't behave like a player.** Album track rows show an ExternalLink on hover and a static Play icon that doesn't play. Replace with a real play/pause control + an equalizer (animated bars) on the "now playing" row.
4. **P0 — Results pop in as one block; no stagger.** Search sources, album tracks, search-result cards all mount at once. Stagger children (40-60ms) so a result set *assembles* like Perplexity/Linear instead of flashing in.
5. **P1 — Search progress has no real motion.** "Searching the web…" relies on a generic `animate-pulse` chip. Add a scanning/shimmer sweep and reveal each source as it's found (the `reviewing` state already streams items but they don't animate in).
6. **P1 — Album art is flat; no depth, no color extraction.** The hero blurs the cover for a backdrop (good) but cards have a plain `shadow-sm`. Pull a dominant color for card glow/section accent so each result feels bespoke to *that* release.
7. **P1 — Generic green ExternalLink badge is the only Spotify signal.** A `lucide` ExternalLink in an emerald circle reads as "AI tool," not Spotify. Use the Spotify glyph + true Spotify green (#1DB954) and a proper "play" affordance instead of "open link."
8. **P2 — Empty/skeleton states are competent but not crafted.** Skeletons pulse uniformly (no shimmer sweep, no stagger) and empties are icon+text. Add a left-to-right shimmer and match skeleton geometry exactly to resolved content so there's zero layout shift / a satisfying cross-fade.

---

## Spotify

### `GetSpotifySearchToolResult.tsx`
**A) Senior designer**
- Problem: Sections render simultaneously and each horizontal rail dumps all cards at once. → Stagger sections (top-down) and cards within a rail (left-to-right, 40ms) via framer `staggerChildren`. → *Results should feel discovered, not dumped.*
- Problem: Section header is a generic uppercase label + a muted count pill — indistinguishable from any AI tool grouping. → Give each category a tiny tinted glyph (artist/album/track icon) and use Spotify's typographic rhythm. → *Category identity is free taste.*
- Problem: 132px fixed-width rail cards with `snap-x` but no scroll affordance (no edge fade, no arrows). → Add gradient edge-fade masks and optional hover arrows on desktop. → *A rail that hides its overflow feels broken; an edge-fade signals "more."*
- Problem: Card count `1` in a pill carries no meaning; `popularity` is available per item and ignored. → Sort each rail by popularity and show a faint popularity tick on cards. → *Order with intent reads as curation.*

**B) vs. higher bar**
- Spotify/Apple search shows artists as circles with a "Verified" check and monthly listeners; here artists are circles with only a genre subtitle. Gap: no follower/listener stat, no verified affordance. → Surface `followers.total` for artists (data already present).
- The horizontal rail is the right instinct (matches Spotify shelves) but lacks the snap-feel and momentum polish of a real shelf. → Add scroll-snap-stop and a subtle scale-on-snap.

### `SpotifyContentCard.tsx` (shared by search, albums, top-tracks via `SpotifyTrackCard`)
**A) Senior designer**
- Problem: Hover affordance is an emerald circle with an **ExternalLink** icon — "open a link," not "play." For tracks especially this is wrong. → Show a **Play** triangle (Spotify-green) on hover for tracks/albums; reserve ExternalLink only as a secondary action. → *On a music card, the primary verb is "play," not "open."*
- Problem: Image hover does `scale-105` only; no shadow lift, no art "press." → Pair scale with a shadow lift and a 200ms ease; on press, a slight scale-down. → *Micro-physics is what separates Linear-grade from template-grade.*
- Problem: `popularity`/`preview_url` on the underlying content are unused. → Add a 3px popularity bar under the title and (for tracks) a hover-to-preview audio toggle. → *The data is already in the payload; not using it is leaving love on the table.*
- Problem: No entrance animation on the card itself (relies on parent). → Make it a `motion` item so parents can stagger it.

**B) vs. higher bar**
- Apple Music/Spotify cards have a persistent, weighty hover-play button with a satisfying spring; ours is a fade-up of a flat circle. Gap: no spring, no real play. → framer spring on the play button; actual `<audio>` preview.
- Track vs. album/artist all render identically through one card. A track in Spotify shows duration + explicit + play; here a track card looks exactly like an album. → Differentiate track cards (duration, explicit badge, equalizer when playing).

### `SpotifyTrackCard.tsx`
**A)** Problem: It's a one-line passthrough to `SpotifyContentCard`, so a track gets zero track-specific treatment (no duration, no explicit, no play, no popularity). → Build a dedicated track presentation (or pass a `variant="track"`). → *A track is the atomic unit of a music app; it deserves its own component love.*
**B)** vs. Spotify "Popular" list on an artist page: that's a numbered row list with art thumb, play-on-hover, play count, and a chart-position feel. Top Tracks here is a 4-col grid of generic cards. → Consider a ranked row layout for Top Tracks specifically (see TopTracksResult below).

### `SpotifyArtistTopTracksResult.tsx`
**A)** Problem: "Top tracks" rendered as an undifferentiated 2-4 col grid loses the ranking that *defines* top tracks. → Render as a numbered list (1-10) with rank, art thumb, title, play count/popularity bar, duration, hover-play + equalizer. → *Ranking is the entire point; a grid throws it away.*
**A)** Problem: No motion; ten cards appear at once. → Stagger rows 30-40ms top-down.
**B)** vs. Spotify artist page "Popular": shows play counts and a subtle bar; the #1 track feels like #1. Gap: every track here has equal visual weight. → Emphasize rank 1-3 (slightly larger number, accent).

### `SpotifyArtistTopTracksSkeleton.tsx`
**A)** Problem: Generic grid of pulsing squares that won't match a ranked-list resolved state if you adopt the recommendation above. → Make skeleton geometry mirror final layout (rows, rank column). → *A skeleton that doesn't predict the result causes a jarring snap.*
**A)** Problem: Uniform `animate-pulse`, no shimmer, no stagger. → Add a left-to-right shimmer keyframe and stagger the rows. → *Shimmer reads as "loading with intent"; pulse reads as placeholder.*

### `GetSpotifyArtistAlbumsResult.tsx`
**A)** Problem: Clever-but-lossy hack — release year is jammed into `artists[0].name` to reuse the card subtitle. This is fragile and hides the artist. → Give the card a real `subtitle`/`meta` prop instead of mutating artist data. → *Overloading a data field to fake a label is the opposite of taste.*
**A)** Problem: Albums in a flat grid with no sort signal; `album_type` (album/single/EP) and popularity unused. → Group or tag by type (Albums / Singles / EPs like Spotify discography) and sort by date. → *Discography structure is expected; a flat dump is not.*
**A)** Problem: No stagger on grid mount. → Stagger.
**B)** vs. Spotify discography: type filter chips, year, "Show all." Gap: ours shows "Showing 8 of N" as text with no way to expand. → Add a real "Show all" affordance or note it's chat-bounded.

### `GetSpotifyArtistAlbumsSkeleton.tsx`
**A)** Problem: Matches the result grid well (good), but uniform pulse and no stagger. → Shimmer + stagger. → *Consistency is there; the polish layer isn't.*

### `GetSpotifyAlbumWithTracksResult.tsx`
**A)** Problem: This is the best component (real hero, motion, track rows) but the track row's hover reveals an **ExternalLink**, and the **Play icon never plays** — it's decorative. → Make the play control real (preview audio) with play/pause state + equalizer on the active row; demote ExternalLink. → *A play button that doesn't play is the single most disappointing thing in a music UI.*
- Problem: Rows have hover bg only; no active/now-playing state, no progress. → Add now-playing styling (accent text, animated equalizer bars) and a thin progress line while previewing. → *"Now playing" is the soul of a player.*
- Problem: Tracks render all at once below the hero. → Stagger rows in after the hero settles (hero, then list cascade). → *Sequenced reveal makes the hero feel like it "loads the record."*
- Problem: `popularity` per track unused; `explicit` is good. → Optional faint popularity bar or play-count column. 

**B)** vs. Spotify album page: sticky play-all button, hover row number→play swap (we have this, but it's fake), and per-track plays. Gap: no "Play album" primary action that actually does anything; the green button just opens Spotify. → If we can't host audio, at least make "Play" preview the track; keep "Open in Spotify" as the deep link.

### `GetSpotifyAlbumWithTracksSkeleton.tsx`
**A)** Problem: Excellent — mirrors the hero + rows closely (best skeleton here). Remaining gap: gradient is static `from-zinc-800 to-zinc-950`, uniform pulse, no shimmer, no stagger. → Add shimmer sweep across the hero and a faint cascade on rows. → *Last 10% of motion is what sells "crafted."*
**A)** Minor: `size-4 w-5` on the track-number block is a redundant/conflicting class (size-4 sets w-4 then w-5 overrides). → Clean to a single intentional width to match the resolved 5-unit column.

### `SpotifyAlbumWithTracksHero.tsx`
**A)** Problem: Blurred-art backdrop + dark gradient is the right move (Apple Music-grade), but the color is washed to near-black so every album looks the same. → Extract a dominant color from the art and let it bleed through (reduce the `black/60` + double gradient so hue survives). → *Color from the art is what makes each record feel like itself.*
- Problem: Cover art is `shadow-2xl ring-white/10` — good — but static. → Subtle parallax/scale on the cover as the card enters. → *A hero that moves once, gracefully, feels alive.*
**B)** vs. Apple Music hero: art casts a colored ambient glow matching the artwork. Gap: ours is monochrome-dark. → Colored ambient glow behind the cover.

### `SpotifyAlbumWithTracksMeta.tsx`
**A)** Problem: Meta row (year • songs • duration) uses three lucide icons (Calendar/Music/Clock) — slightly noisy and generic. → Drop icons or use middots like Spotify ("2023 · 12 songs · 48 min"). → *Spotify's metadata is icon-free and calmer; restraint reads as taste.*
- Problem: "Listen on Spotify" is emerald-500 (close) but uses ExternalLink, not the Spotify glyph; corners/weight are generic pill. → Use exact Spotify green + Spotify mark; this is the brand moment. → *Get the one branded button exactly right.*
**B)** vs. Spotify: genres/label as quiet metadata, not bordered chips. Our white/30 bordered chips over art are heavier than Spotify's. → Lighten to text or ghost chips.

### `SpotifyDeepResearchResult.tsx` (socials grid via `ArtistSocial`)
**A)** Problem: The socials grid is the strongest "data product" candidate but renders as plain bordered cards with platform name + follower count text. → Make it a stat grid: large follower number (tabular), platform-colored icon, and a tiny trend/affordance; stagger-in. → *Numbers are the story; let them be big and proud.*
- Problem: No motion on grid mount; `ArtistSocial` has a nice hover lift (good) but cards appear at once. → Stagger 50ms. 
- Problem: Subtitle counts platforms ("3 platforms found") — fine, but the header icon (Mic2) and tone (success green) don't say "research/socials." → Consider a distinct accent (violet `accent` tone exists in tokens) to differentiate deep-research from plain search. → *Distinct tone = distinct mental model.*
**B)** vs. an artist dashboard (Linktree/Chartmetric quality): platform brand colors, follower deltas, sparklines. Gap: ours is monochrome with one static number. → Brand-color the icon chips at minimum; sparkline if data allows.

### `SpotifyDeepResearchSkeleton.tsx`
**A)** Problem: 4 generic bordered boxes with two pulsing bars — doesn't foreshadow the icon+name+followers layout. → Mirror the resolved card (icon chip circle + name bar + number bar) and shimmer. → *Skeleton should rehearse the result.*

---

## Web Search

### `SearchApiResult.tsx`
**A) Senior designer**
- Problem: Titled "Sources" with a Globe + count pill — competent but indistinguishable from Perplexity *minus* the craft (no numbered citations, no stagger). → Number the sources [1..n] to match inline citations and stagger reveal. → *Numbered sources tie the answer to evidence; that's the trust moment.*
- Problem: Results mount as a static list. → Stagger items 40ms with fade-up. 
**B) vs. Perplexity:** Perplexity shows a horizontal source strip with favicons + domain, then expandable, with citation numbers. Ours is a vertical list, no numbering, no grouping by domain. → Add citation numbers; consider a compact "top sources" strip + count.

### `SearchResultItem.tsx`
**A)** Problem: Good anatomy (favicon + domain + date + title hover-to-primary). Missing: citation number, and the favicon fallback is fine but there's no domain-color or letter-avatar fallback for missing favicons (relies on a generic fallback URL). → Add a numbered badge and a letter/initial fallback tile. → *A graceful favicon fallback is a small kindness that shows care.*
- Problem: No hover motion beyond bg color; title color-shift only. → Add a subtle translate-x on the row + arrow on hover (Perplexity/Linear). 
**B)** vs. Perplexity source card: shows domain, date, snippet, and a citation index — ours nails 3 of 4 (no index). Close to the bar; add numbering and it's there.

### `SearchWebSkeleton.tsx`
**A)** Problem: Solid skeleton that mirrors header + 3 rows (good). Gaps: hardcoded blue chip duplicates ToolCard's `info` tone instead of reusing it (drift risk), uniform pulse, no stagger, no shimmer. → Reuse tone tokens; add shimmer + per-row stagger. → *Re-implementing the tone chip invites visual drift; reuse keeps the family tight.*

### `SearchWebProgress.tsx`
**A)** Problem: Three real states (searching/reviewing/streaming) — great structure — but each just swaps an icon and leans on `loading` pulse. The `reviewing` state appends `SearchResultItem`s with **no entrance animation**, so sources flash in. → Animate each found source in (fade-up, 50ms apart) so it reads like live discovery. → *Watching sources arrive one-by-one is the magic of live search; don't waste it.*
- Problem: "Searching" → "Reviewing" → "Synthesizing" transitions are hard cuts. → Cross-fade/`AnimatePresence` between phases and animate the count up. → *Smooth phase transitions feel like one continuous thought.*
- Problem: No scanning/progress visual — just a pulsing chip. → Add a thin indeterminate progress bar or a scanning shimmer on the header. → *A search that shows it's working earns patience.*
**B)** vs. Perplexity's live "Searching / Reading sources" with animated source thumbnails appearing: we have the data flow but not the choreography. → Add the choreography (stagger + count-up + phase cross-fade).

### `SearchQueryPill.tsx`
**A)** Problem: `active` state is just `animate-pulse` on the search icon — generic. → Replace with a subtle shimmer sweep across the pill or a typing/caret feel for the query. → *A query "in flight" should feel like it's being typed/scanned, not throbbing.*
**B)** Minor: pill is tasteful and on-bar; lowest priority. Consider showing the query in a monospace/quoted treatment to read as "the exact thing searched."

---

## Implementation notes (shared)
- Add a `staggerChildren` motion variant to `toolCardTokens.ts` and have grids/lists/rails consume it via a `motion` parent + `motion` items. Single source keeps the family consistent (the file's own comment: "award-winning comes from consistency").
- Add a shimmer keyframe (left-to-right gradient sweep) as a shared util and apply to all skeletons; retire bare `animate-pulse` for content skeletons.
- Surface already-available data: `popularity` (meter), `followers.total` (stat), `preview_url` (audio). This is the highest taste-per-effort ratio in the whole audit.
- Replace ExternalLink-in-green-circle with a real Play affordance + the Spotify glyph/green for branded moments; keep ExternalLink as a secondary "open in Spotify."
- Audio preview needs a small shared player hook (single global `<audio>`, one track plays at a time, equalizer bars driven by play state) — biggest lift, biggest payoff.
