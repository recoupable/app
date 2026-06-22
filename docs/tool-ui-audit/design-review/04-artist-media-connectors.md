# Design Review — Artist / Media / Connectors Tool UI

Reviewer: senior product designer. Scope: chat tool-response cards for artist & socials,
media generation (image / video / txt), and connectors / monitoring (Composio, Pulse,
YouTube revenue, sandbox, file update). No component code was changed.

Two lenses per component:
- **(A) Senior designer** — hierarchy, spacing, type, tone, motion/streaming, and how to
  differentiate so it feels crafted, not a generic AI chip.
- **(B) Customer vs. higher-bar platforms** — Midjourney / Higgsfield (media),
  Stripe / Linear (connectors, revenue), Raycast / Vercel (polish).

Priorities: **P0** = visible quality/trust gap worth doing first; **P1** = clear craft win;
**P2** = polish/nice-to-have.

---

## Shared system context (baseline)

The shared `ToolCard` / `ToolCardSkeleton` / `toolCardTokens` system is genuinely good: one
radius/border/shadow language, tonal icon chips, a shared fade+rise entrance
(`opacity 0→1, y 6→0, 0.28s`). That consistency is the foundation. The findings below are
mostly about the places that either (a) bypass the system, (b) lean on `animate-pulse` as the
only motion, or (c) miss a moment where a premium product would invest a custom touch.

One system-wide note up front (applies to nearly every card): **the only loading motion in
the entire surface is `animate-pulse`.** Pulse is the generic "AI chip" tell. A single shared
shimmer/sweep keyframe (a diagonal highlight translating across skeletons) would lift every
loading state at once. Treat this as a **P1 platform task** referenced throughout.

---

## ARTIST / SOCIALS

### 1. CreateArtistToolCall.tsx
**(A)** A bare `ToolCardSkeleton` with `rows={0}`, "Creating new artist…", Sparkles chip.
- Problem: The loading card is `max-w-sm` but the resolved `GenericSuccess` is also `max-w-sm`
  — good, no jump. But the loading copy promises "Creating" while the resolved card adds a
  second async phase ("Setting up artist conversation…") that the skeleton doesn't foreshadow,
  so the user sees two different "in-progress" framings back-to-back.
  → Change: keep one continuous progress narrative ("Creating artist…" → "Setting up
  conversation…" → "Ready") rather than skeleton then a new spinner inside success.
  → Love rationale: a single story beat reads as one intentional moment, not two stitched states.
- Problem: Sparkles chip uses default neutral tone; the resolved card is `success` (emerald).
  Color shifts on resolve.
  → Change: tint the loading chip with the same accent it will resolve to (or neutral both).
  → Rationale: color continuity is what makes a transition feel like one object, not two cards. (P2)

**(B)** Linear's optimistic create is instant and silent; here we have a two-phase spinner for a
create that the user just initiated. Fine, but the "Setting up artist conversation…" phase has
no progress signal — against a Vercel bar/step indicator it reads as "is it stuck?" **P1.**

### 2. CreateArtistToolResult.tsx
**(A)** Renders `GenericSuccess` with avatar + name + message; falls back to `ToolError`.
- Problem: This is the birth of a brand-new artist — arguably the highest-emotion moment in the
  app — and it renders the *generic* success card (`max-w-sm`, quiet by design). It looks
  identical to "file updated."
  → Change: give creation a bespoke celebratory card — larger avatar, the artist name as the
  hero, a one-line "Added to your roster" with a subtle entrance scale/confetti-free shine on
  the avatar ring.
  → Rationale: first-run moments deserve a little ceremony; sameness here wastes the one time a
  user actually cares. **P1.**
- Problem: `isProcessing` message "Setting up artist conversation…" sits in the *subtitle* slot
  with no spinner/affordance — static text that looks like a final state.
  → Change: add an inline animated indicator (dots/bar) while `isProcessing`. (P1)

**(B)** Midjourney/Linear treat "new entity created" as a confirmable, navigable object (click to
open). Here there's no CTA to jump into the new artist. Add a "Open" / "Start chatting" action. **P1.**

### 3. GetArtistSocialsResult.tsx
**(A)** `ToolCard` accent tone, 2/3/4-col grid of `ArtistSocial` tiles, count pill, empty state.
- Strong: subtitle "N platforms connected", trailing count pill, responsive grid. This is one of
  the better cards.
- Problem: count appears twice (subtitle "3 platforms connected" + trailing "3" pill) — redundant.
  → Change: drop the numeric pill, or replace it with a meaningful aggregate (total followers).
  → Rationale: every pixel should add information; a duplicated count reads as filler. (P2)
- Problem: no sort signal — tiles render in array order, not by follower count or platform priority.
  → Change: sort by followers desc (or a canonical platform order).
  → Rationale: a curated order signals the product has a point of view. (P2)

**(B)** vs. Linear/Stripe connection lists: solid. The missing taste touch is brand color — every
tile is monochrome `text-foreground/70` (see #5). A roster dashboard from a higher-bar product
would let platform identity through. **P1** (lives in ArtistSocial).

### 4. GetArtistSocialsSkeleton.tsx
**(A)** `ToolCardSkeleton` `rows={4}`, `max-w-xl`, Users icon.
- Problem: the resolved result is a **grid of tiles**, but the skeleton is a **vertical list of
  rows**. The loading shape doesn't match the resolved shape → layout jump on resolve, defeating
  the skeleton's whole purpose.
  → Change: make the skeleton render placeholder *tiles* in the same 2/3/4-col grid.
  → Rationale: a skeleton that morphs into a different layout is worse than none — it breaks the
  illusion of continuity. **P0.**
- Apply the shared shimmer (P1) instead of pulse.

**(B)** Vercel/Linear skeletons are pixel-congruent with their resolved content. This one isn't. **P0.**

### 5. ArtistSocial.tsx
**(A)** Per-platform tile: icon chip, platform name, display text, follower count, hover lift +
external-link reveal.
- Strong: hover `-translate-y-0.5` + shadow + icon reveal is a nice crafted micro-interaction.
- Problem: all platform icons render in neutral `text-foreground/70` on `bg-muted`. Instagram,
  YouTube, Spotify, TikTok all look identical and gray.
  → Change: tint each chip with its brand color (YouTube red, Spotify green, etc.) at low opacity,
  matching the tonal-chip pattern already in `toolCardTokens`.
  → Rationale: brand recognition is instant and makes a roster feel alive vs. a gray spreadsheet. **P1.**
- Problem: icon mapping is lossy — TikTok, Spotify, Apple all map to `Music2`; Threads → `Twitter`.
  → Change: use proper brand glyphs (the app already imports brand-ish lucide icons elsewhere).
  → Rationale: a designer notices when TikTok and Spotify share an icon. (P2)
- Problem: follower count only shows when `> 0`; tiles with/without followers have different
  heights → ragged grid.
  → Change: reserve the follower line (show "—" or platform handle) for even tile heights.
  → Rationale: an even baseline grid reads as designed. (P2)

**(B)** vs. Linear's integration tiles: the hover lift is on par. Brand color + real glyphs is the
gap. **P1.**

### 6. ArtistSocialDisplayText.tsx
**(A)** Pure logic component picking username / channel name / raw URL.
- Problem: falls back to the *full raw profile_url* truncated — long URLs read as noise under the
  platform name.
  → Change: prefer a clean handle; if only URL exists, strip protocol + trailing path to a domain.
  → Rationale: showing `https://…/channel/UC9bk…` looks like debug output, not a profile. (P2)

**(B)** Minor; no platform comparison needed.

### 7. ArtistHeroSection.tsx
**(A)** 64px avatar, name, emerald success line, label + updated-at meta. Used inside
UpdateArtistSocialsSuccess.
- Strong: clean hierarchy, good use of meta row.
- Problem: it duplicates the parent `ToolCard` header (which also shows artist name + success
  subtitle). When nested in UpdateArtistSocialsSuccess you get the name twice and two success
  confirmations stacked.
  → Change: either the ToolCard header OR the hero owns identity, not both. (P1, see #10)
- Problem: raw `<img>` with no loading/blur state — avatar pops in.
  → Change: add a muted placeholder / fade-in on load.
  → Rationale: a popping avatar is the cheapest tell that no one polished the load path. (P2)

**(B)** vs. a Stripe customer header: fine, but the doubled identity (with parent) is the kind of
thing a Linear review would reject. **P1.**

### 8. KnowledgeBaseSection.tsx
**(A)** Uppercase section label with count, list of file rows with hover bg + external-link reveal.
- Strong: consistent with the row pattern; tidy.
- Problem: every item shows the same generic `FileText` icon regardless of `knowledge.type`.
  → Change: map type → icon (pdf/doc/link/sheet).
  → Rationale: typed icons let users scan by kind, not just read labels. (P2)
- Problem: `key={index}` — not a bug visually, but reorder/animate later will glitch. (P2)

**(B)** Fine for an internal KB list; no premium gap.

### 9. UpdateArtistInfoSuccess.tsx
**(A)** ToolCard success with avatar, instructions block, KB section, organization row.
- Strong: good progressive disclosure (`hasBody` gates the body); empty-state collapses to a
  compact confirmation.
- Problem: the "Custom instructions" block can render an arbitrarily long paragraph fully expanded
  inside a chat bubble — no clamp.
  → Change: line-clamp to ~3 lines with "Show more".
  → Rationale: a result card should summarize, not dump; respect the reading rhythm of chat. (P1)

**(B)** vs. Linear's settings-saved toast: this is richer than needed, which is fine, but the
unclamped instruction is the one untidy spot. **P1.**

### 10. UpdateArtistSocialsSuccess.tsx
**(A)** ToolCard + nested ArtistHeroSection + list of social rows.
- Problem (compounding #7): ToolCard header says "Artist socials updated" + message; then
  ArtistHeroSection repeats the artist name + the *same message* again with another check. Two
  success confirmations, two checkmarks, message printed twice.
  → Change: drop the message from the hero (pass none), or drop the hero and inline the avatar in
  the ToolCard `media` slot.
  → Rationale: one confirmation per action — repetition reads as a bug, not emphasis. **P0.**
- Problem: each social row uses a generic `Globe` icon for *every* platform and shows the raw
  `profile_url` as the title — inconsistent with the much nicer `ArtistSocial` tile component that
  already exists.
  → Change: reuse `ArtistSocial` (or its icon mapping) here instead of a bespoke `Globe` row.
  → Rationale: two different visual languages for "a social link" in adjacent cards is exactly the
  inconsistency the shared system was built to prevent. **P1 (DRY).**

**(B)** vs. Stripe's "payment method updated": Stripe shows the *card brand* glyph, not a generic
globe. Same principle. **P1.**

---

## MEDIA

### 11. image/ImageResult.tsx
**(A)** Rounded card, hover top/bottom gradient scrims, download button, `next/image` priority.
- Strong: the gradient scrims + hover download is a tasteful gallery affordance.
- Problem: **no blur-up / poster reveal.** The image just appears when loaded; the premium media
  feel (Midjourney/Higgsfield) comes from a blurred placeholder resolving to sharp, or a soft
  fade/scale-in.
  → Change: add a blur-up (use `next/image` `placeholder="blur"` with a tiny base64, or a CSS
  blur→clear transition) and a 200–300ms opacity/scale reveal on load.
  → Rationale: the reveal *is* the product moment for generative media; without it the result
  feels like a static asset, not something just conjured. **P0.**
- Problem: no click-to-expand / lightbox. `cursor-pointer` is set but clicking does nothing.
  → Change: open a full-res lightbox on click (the cursor already promises it).
  → Rationale: a pointer cursor that does nothing is a broken promise. **P1.**
- Problem: download button only visible on hover; on touch there's no hover.
  → Change: persistent (or tap-revealed) action on touch. (P2)

**(B)** vs. Midjourney/Higgsfield: those treat each generation as a hero with reveal animation,
upscale/vary actions, and a lightbox. We have a plain framed image. The reveal (P0) and lightbox
(P1) are the difference between "AI tool output" and "premium media canvas."

### 12. image/ImageSkeleton.tsx
**(A)** Header (Wand2 chip + "Generating image…") + square pulsing gradient placeholder with a
faint ImageIcon.
- Strong: aspect-correct (`aspect-square`) so no jump to the image — good.
- Problem: the placeholder is a *static* `animate-pulse` gradient. Generation is the moment to
  show craft.
  → Change: a slow diagonal shimmer sweep across the placeholder (like a developing photo), and
  ideally an indeterminate progress hint ("usually a few seconds" is there; pair with a thin
  moving bar).
  → Rationale: a developing-photo shimmer makes waiting feel like creation, not buffering. **P1.**
- Problem: resolved `ImageResult` is `max-w-md` with `aspect: auto/contain`, but the skeleton
  forces `aspect-square` — non-square results will jump.
  → Change: if aspect ratio is known from the request, mirror it. (P2)

**(B)** Midjourney's grid fills in progressively with a shimmer. This is close but the static
gradient is the tell. **P1.**

### 13. sora2/Sora2VideoResult.tsx
**(A)** ToolCard accent, native `<video controls>`, download button in trailing, error/empty states.
- Strong: clean, file size + "Sora 2" subtitle, graceful video-error fallback.
- Problem: **no poster frame.** `preload="metadata"` shows a black/empty `bg-black` box until
  play. Premium video UIs show a poster/first-frame with a play overlay.
  → Change: set a `poster` (thumbnail) and overlay a play affordance; fade video in on `canplay`.
  → Rationale: a black rectangle is the least premium way to present a freshly generated video. **P0.**
- Problem: download uses a raw `document.createElement("a")` with no loading/feedback (vs. the
  image's `useImageDownloader` with `isDownloading`/`isReady`). Inconsistent and silent.
  → Change: reuse a shared downloader hook with progress state.
  → Rationale: two download patterns in adjacent media cards = inconsistency users feel as jank. **P1.**

**(B)** vs. Higgsfield/Sora's own UI: poster + reveal + hover-scrub. We have a controls-only player.
Poster + reveal (P0) closes most of the gap.

### 14. sora2/Sora2VideoSkeleton.tsx
**(A)** Header + `aspect-video` pulsing placeholder with a play glyph in a blurred pill.
- Strong: aspect-correct, the backdrop-blur play pill is a nice touch — best of the skeletons.
- Problem: copy "this can take a moment" but video gen can take *minutes*; no elapsed time or
  progress, so long waits feel frozen.
  → Change: add an elapsed timer and/or staged copy ("Rendering frames…", "Almost there…").
  → Rationale: for multi-minute waits, a sign of life is the difference between trust and a reload. **P1.**
- Shared shimmer instead of pulse (P1).

**(B)** Runway/Higgsfield show progress % or stage during long renders. A static pulse for minutes
is the weakest spot here. **P1.**

### 15. ui/TxtFileResult.tsx
**(A)** ToolCard info, fetches Arweave content into a scrollable mono block, download button.
- Strong: animated `max-height` transition, mono code styling, scrollbar styling, error states.
- Problem: fetches the *entire* file into chat with only a 200–400px scroll cap — large files dump
  a wall of mono text into the conversation.
  → Change: show a preview (first N lines) with "View full file" → expand/modal; lazy-fetch.
  → Rationale: a chat result should be a glanceable summary, not the whole document inline. **P1.**
- Problem: "Stored on Arweave" subtitle is jargon to non-technical users; transaction/explorer
  fields exist in the type but aren't surfaced or explained.
  → Change: friendlier framing ("Saved permanently • view file"); hide chain jargon or put it
  behind a details affordance.
  → Rationale: speak the user's language; "Arweave/tx hash" is plumbing, not value. (P2)
- Problem: download = `window.open` (new tab), not a real download; mismatched with the Download
  label/icon.
  → Change: actual download, or relabel "Open". (P2)

**(B)** vs. Vercel's file/log viewers: they preview + expand + copy. We dump + scroll. **P1.**

---

## CONNECTORS / MONITORING

### 16. composio/ComposioAuthResult.tsx
**(A)** Pure dispatcher (active → ConnectedState, initiated → ConnectPrompt, else null).
- Problem: returns `null` on any malformed/unknown result — the tool ran but the user sees
  *nothing*, with no explanation.
  → Change: render a neutral fallback ("Couldn't read connection status") instead of silence.
  → Rationale: silent nulls erode trust — a connect flow especially must never just vanish. **P1.**

**(B)** Stripe Connect never shows nothing; there's always a status. **P1.**

### 17. composio/ComposioConnectPrompt.tsx
**(A)** Info ToolCard, explanatory line, full-width blue CTA, "link expires in 10 minutes" note,
https-only safe redirect.
- Strong: the safe-redirect guard + expiry note + emphasized ring is genuinely trustworthy. Good.
- Problem: the CTA is hardcoded `bg-blue-600/bg-blue-700`, bypassing the design-token system
  (`primary`, tonal `info`). It won't theme and is a one-off blue.
  → Change: use the `Button` primitive / `primary` token (or `info` tone) for the CTA.
  → Rationale: a bespoke hex CTA in a token-driven system is the seam where polish leaks. **P1.**
- Problem: when `isUnsafe`, the button just dims to 60% with no message — user can't tell why it's
  dead.
  → Change: swap to an inline error ("This link looks invalid — please retry"). (P2)
- Problem: copy says "enable this connector" / "Connect your X account" — slightly mechanical;
  doesn't say *what access* or *why* (the trust ask).
  → Change: one line on scope ("We'll read your Sheets to …"). (P2)

**(B)** vs. Stripe/Linear OAuth: those state the scope and brand the provider. The plumbing here is
safer than most, but the CTA token + scope copy are the taste gap. **P1.**

### 18. composio/ComposioConnectedState.tsx
**(A)** Success ToolCard "X connected" / "Ready to use" + restating sentence.
- Problem: the body sentence ("Your X account is connected and ready to use.") just repeats the
  title + subtitle — three ways of saying the same thing, no new info.
  → Change: replace the body with something actionable (what you can now do, or a "Manage
  connection" link), or drop the body entirely.
  → Rationale: redundancy in a confirmation feels like filler, not polish. (P2)
- Problem: no provider brand mark — generic check chip for every connector.
  → Change: show the provider logo/glyph. (P2)

**(B)** Linear's "Connected ✓" rows show the provider logo and a manage link. We show a green check
three times. (P2)

### 19. pulse/PulseToolResult.tsx
**(A)** Success ToolCard, title links to /tasks?tab=pulses, a toggle row with loading skeleton.
- Strong: live toggle inside the card with proper `isToggling`/`isInitialLoading` states — nicely
  interactive, not just a static report.
- Problem: tone is always `success` (emerald) even when Pulse is *off* — green signals "on/good"
  but the actual state may be disabled.
  → Change: tone should follow `active` (success when on, neutral when off).
  → Rationale: color must tell the truth; green-while-off is a small lie users subconsciously
  catch. **P1.**
- Problem: only shows a single toggle — no preview of *what* the digest contains or when it sends.
  → Change: add the send time / a one-line "what you'll get". (P2)

**(B)** vs. Linear's notification settings: they preview cadence + content. We show a lone toggle.
Functional, a touch thin. (P2)

### 20. pulse/PulseToolSkeleton.tsx
**(A)** Mirrors PulseToolResult anatomy (chip + two text lines + toggle row). Good congruence.
- Problem: emerald chip presupposes the success tone; if the result resolves to neutral (off) the
  chip color shifts. (P2)
- Shared shimmer instead of pulse (P1).

**(B)** Solid. Minor.

### 21. youtube/YouTubeRevenueResult.tsx
**(A)** ToolCard, monetized badge, stats grid, date range, daily bars, estimate disclaimer.
- Strong: this is the most "dashboard-grade" card — good structure, honest "estimated" framing,
  monetized state, sensible footer disclaimer.
- Problem: channel shown as `channelId.slice(0,8)…` — a raw opaque ID, not a channel name.
  → Change: resolve to channel title (+ avatar) if available; otherwise label it ("Channel ID").
  → Rationale: a truncated ID is debug data; users think in channel names. **P1.**
- Problem: no currency/locale indication beyond `formatCurrency` default; revenue analytics should
  state the currency explicitly.
  → Change: surface currency code near the total. (P2)

**(B)** vs. Stripe's revenue cards: Stripe leads with a big animated headline number, a sparkline,
and period-over-period delta. We have the headline + bars but **no trend/delta and no count-up
animation** (see #22/#23). **P1.**

### 22. youtube/YouTubeRevenueStats.tsx
**(A)** Three stat tiles: total (emerald headline), best day, daily average. Tabular-nums, good.
- Strong: `tabular-nums`, color-coded tile accents, clear hierarchy (total is `text-2xl`).
- Problem: numbers render statically — a premium revenue card *counts up* the headline figure.
  → Change: animate the total (and ideally each tile) with a count-up on mount (respecting
  `prefers-reduced-motion`).
  → Rationale: a number that ticks up makes revenue feel earned and alive — the single highest-ROI
  motion in this whole audit. **P1.**
- Problem: no period-over-period delta (▲ vs. prior 30 days) — the most useful glance metric is
  absent.
  → Change: add a delta chip on the total tile when prior-period data exists. (P1)
- Problem: the three tiles use three *different* accent colors (emerald/blue/violet) for metrics
  that aren't categorically different — reads slightly arbitrary.
  → Change: make total the only colored tile; keep best/avg neutral, or use one consistent accent.
  → Rationale: color should encode meaning; rainbow tiles dilute the headline. (P2)

**(B)** Stripe/Linear analytics: count-up + delta + restrained color. We have layout but not the
motion or the comparison. **P1.**

### 23. youtube/YouTubeRevenueDaily.tsx
**(A)** Last-7-day horizontal bars, label + bar + value rows, normalized to max.
- Strong: clean, legible, value-aligned right with tabular-nums.
- Problem: bars are **static** — no grow-in animation. The brief explicitly wants "subtle animated
  bars."
  → Change: animate each bar's width from 0→pct on mount with a small stagger (40–60ms) and easing;
  respect reduced-motion.
  → Rationale: staggered bars growing in is the signature "this chart was crafted" moment. **P1.**
- Problem: bar fill is a flat `bg-emerald-500/25` — very low contrast, hard to read magnitude.
  → Change: bump opacity / add a subtle gradient; consider highlighting the best day.
  → Rationale: a chart you have to squint at isn't doing its job. (P2)
- Problem: only 7 days shown though 30 are fetched — no sparkline/overview of the full range.
  → Change: add a compact 30-day sparkline above the 7-day detail. (P2)

**(B)** vs. Stripe's bar/area charts: animation + readable fills + full-range context. The static,
faint bars are the clearest "lacks love" spot in the revenue feature. **P1.**

### 24. youtube/YouTubeRevenueSkeleton.tsx
**(A)** Faithfully mirrors the resolved card (header, 3 stat tiles, date row, 7 bars, footer).
- Strong: **best-in-class congruence** — this is exactly how skeletons should be built; near-zero
  layout jump. Use it as the reference for fixing #4.
- Problem: shared shimmer over pulse (P1). (P2 here since structure is already excellent.)

**(B)** On par with Vercel/Linear skeletons. 

### 25. youtube/YouTubeRevenueError.tsx
**(A)** Thin wrapper over shared `ToolError`.
- Problem: generic error message; revenue failures are usually *specific* (not monetized, channel
  not connected, scope missing) — a flat error misses the chance to guide.
  → Change: when the cause is known (e.g. not connected), render a connect CTA instead of a dead
  error.
  → Rationale: turning a failure into a next step is what trustworthy products do. **P1.**

**(B)** Stripe errors are actionable ("Reconnect account"). Ours is a dead end. **P1.**

### 26. sandbox/RunSandboxCommandResultWithPolling.tsx (+ RunDetails / RunOutput / RunLogsList)
**(A)** Terminal-style polling skeleton (mono lines, amber "In progress" dot) → `RunDetails`
(timeline, current step, result `pre`, activity log, run id).
- Strong: the *skeleton* is well done — mono placeholder lines + amber pulse dot read as a real
  terminal booting. Good non-technical header ("Executing in a secure sandbox").
- Problem: **major visual discontinuity** — the polished `max-w-xl` ToolCard skeleton resolves into
  `RunDetails`, which is a totally different layout (`p-6`, `gap-6`, `text-lg`, no card chrome,
  full-width). The crafted terminal frame evaporates on completion.
  → Change: wrap `RunDetails` (or a chat-specific variant) in the same ToolCard shell, or have the
  skeleton mirror RunDetails. Right now loading ≠ result.
  → Rationale: the skeleton promised a terminal; the result delivers a settings page. Continuity
  is the whole point of the skeleton. **P0.**
- Problem: the actual output/logs (`RunOutput` `pre`, `RunLogsList`) are muted gray mono on
  `bg-muted/30` — *not* a real terminal look (no dark bg, no prompt, no monospace contrast). The
  brief wants a "legible terminal." Currently it reads as quoted text.
  → Change: render logs/output in a proper terminal surface (dark bg, light text, optional prompt
  glyph, line numbers), with the existing auto-scroll.
  → Rationale: a terminal that doesn't look like a terminal undersells the (impressive) fact that
  real code just ran. **P1.**
- Problem: logs stream via auto-scroll (good) but the *skeleton→RunDetails* swap means streaming
  only starts after the card changes shape; no streamed feedback during the polling skeleton.
  → Change: stream early log lines into the terminal skeleton itself. (P1)
- Problem: non-technical framing is good in the skeleton but lost in RunDetails ("Activity Log",
  raw run id, `taskIdentifier`) — jargon returns.
  → Change: keep the human framing ("Here's what ran") in the result. (P2)

**(B)** vs. Vercel's build logs / Raycast's script output: those are true dark terminals with
streaming and a stable frame. Ours is a great skeleton that resolves into an un-themed details
page. The skeleton→result discontinuity (P0) + non-terminal output styling (P1) are the gaps.

### 27. files/UpdateFileResult.tsx
**(A)** Success ToolCard, "Updated <file>", meta (Verified · size), "Saved" pill, mono path row
(linked if safe), cache invalidation on mount.
- Strong: safe-href guard, mono path, "Saved" pill, verified/size meta — tidy and trustworthy.
- Problem: redundant success signaling — `tone="success"` chip + green "Saved" pill + the implicit
  "Updated" title all say the same thing.
  → Change: keep one strong success cue (the pill or the tone), simplify the rest. (P2)
- Problem: no diff / "what changed" — for a file *update* the most useful thing (lines added/
  removed, before/after) is absent.
  → Change: surface a tiny change summary or "View changes" link when available.
  → Rationale: "updated" without "what changed" makes the user re-open the file to trust it. **P1.**
- Problem: the path row is `cursor-pointer` and linked, but visually it's just text + a faint
  FileEdit icon — the affordance is weak.
  → Change: add a trailing external-link/chevron + hover state to signal it opens. (P2)

**(B)** vs. Linear/GitHub file edits: those show a diff or at least a changed-lines count. We show
"Saved." Adding change context (P1) is the upgrade.

---

## Top 8 summary (do these first)

1. **P0 — Image reveal (blur-up + fade/scale-in).** `ImageResult` shows generated media with zero
   reveal; this is the core premium moment for any media product (Midjourney/Higgsfield). [#11]
2. **P0 — Sora video poster + reveal.** Replace the black `bg-black` box with a poster frame, play
   overlay, and fade-in on `canplay`; a black rectangle is the least premium video presentation. [#13]
3. **P0 — Sandbox skeleton↔result continuity.** The crafted terminal skeleton resolves into an
   un-themed `RunDetails` page; wrap the result in the same shell so loading == result. [#26]
4. **P0 — Socials skeleton matches the grid.** `GetArtistSocialsSkeleton` is a row list but resolves
   to a tile grid → layout jump; rebuild the skeleton as placeholder tiles. [#4]
5. **P0 — Kill doubled confirmations in UpdateArtistSocialsSuccess.** ToolCard header + nested
   ArtistHeroSection print the artist name, message, and checkmark twice. One confirmation per
   action. [#10, #7]
6. **P1 — Animate the revenue (count-up total + growing bars + delta).** The brief's
   "beautiful stat card + animated bars"; today numbers and bars are static and faint, and there's
   no period-over-period delta. [#22, #23]
7. **P1 — Brand identity for socials + connectors.** Per-platform brand color/glyph in
   `ArtistSocial` (and reuse it in UpdateArtistSocialsSuccess instead of a generic `Globe`);
   provider logos in Composio states. Monochrome lists read as a gray spreadsheet. [#5, #10, #18]
8. **P1 — Shared shimmer keyframe + trustworthy connect polish.** Replace `animate-pulse` across all
   skeletons with one diagonal shimmer; move ComposioConnectPrompt's hardcoded blue CTA onto the
   token/`Button` system and never render `null` (ComposioAuthResult) on unknown status. [system, #17, #16]
