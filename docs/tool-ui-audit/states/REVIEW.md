# Tool-response UI — design pass (review before merge)

Screenshots of **every tool component, in every state**, captured in isolation from
the real components via Storybook (real `globals.css`, real `.dark` toggle, no app
chrome) using headless Chromium.

- **Before:** [`./before/`](./before) · **After:** [`./after/`](./after)
- Full design reasoning (two lenses per component — senior designer + customer vs.
  higher-bar platforms): [`../design-review/`](../design-review)
- Each screenshot file is named by its Storybook id, e.g.
  `tool-states--you-tube-result.png`. Open the same filename in `before/` and
  `after/` to compare.

How to explore interactively: `pnpm storybook` → **Tool States** / **Chat Tools**.

---

## Headline: clarity for unknown / MCP / "technical" tools (the Bash problem)

**Before:** a tool without bespoke UI (e.g. a shell/`Bash` tool) showed only its raw
name + "Data processed". Fired repeatedly, it looked like the product was frozen or
looping.
**After (`tool-states--tool-card-repeated-calls`):** a `GenericToolCard` shows
- a friendly name + a **plain-English explanation** ("Runs a command in a secure sandbox"),
- the **exact input it ran this call** echoed (`git status`, `npm install`, `npm run build`),
- a collapsible **Show output**, and a **Working → Done** state.
- *Love / attention:* because each call echoes its distinct command, five repeated
  calls read as five intentional steps — never a broken loop. Driven by a new
  `summarizeToolInput` (pulls command/query/url/path/…) + a plain-English
  `description` registry in `getToolInfo`.

---

## Per-component notes (improvement · motion · love)

### Spotify
- **Content card / albums / top tracks** — popularity now shows as a Spotify-green
  meter, artist follower counts surfaced. *Motion:* grids cascade in
  (`staggerChildren`). *Love:* hover lifts the card + nudges the art; the
  artist-name-overwritten-with-year hack is gone (real `subtitle` prop).
- **Album with tracks** — rows feel like a player: track number swaps to a green
  Play on hover, per-track popularity micro-bar. *Motion:* a 3-bar **now-playing
  equalizer** animates on the hovered row; rows cascade in *after* the hero settles.
- **Hero / meta** — lighter scrim so the artwork's hue survives; calm middot meta
  ("2023 · 12 songs · 48 min"); one true-Spotify-green action. *Love:* the cover does
  a single graceful scale+fade "load the record."
- **Search results** — discovery-feed staggering (sections top-down, cards L→R).

### Web search
- **Results** — staggered sources with **citation numbers**, favicon + first-letter
  fallback. *Motion:* title nudges right and an arrow slides in on hover.
- **Progress** — source count **counts up**; sources stream in one-by-one
  (`AnimatePresence`). *Love:* reads as live discovery, not a spinner.
- **Query pill / skeleton** — shimmer sweep instead of a flat pulse.

### Chats
- Relative timestamps ("2d ago"); per-row **deterministic first-letter avatars**
  (hashed tint) replace the identical repeated icon; list staggers in.

### Artist & socials
- **Socials grid** — brand-colored platform chips (IG pink, YT red, Spotify green…).
  *Motion:* tiles stagger in. **P0 fix:** the skeleton now mirrors the result *grid*
  (was a row list → caused a layout jump).
- **Update-socials confirmation** — **P0 fix:** the artist name/success/check printed
  twice; now once. Rows reuse the brand-glyph treatment.

### Tasks & automation
- **Task card** — renders **Next run** (the scheduler's core trust signal); schedule
  on its own line; raw cron never leaks (friendly fallback, no `console.error`); the
  status pill **stays visible** when reaching for actions; dead Edit button removed.
- **Create / Update / Delete** — now distinct: scheduled (emerald "land" pulse) vs.
  updated (blue) vs. cancelled (desaturate + settle, shows the cancelled future).
- **Get tasks** — staggered entrance. **Errors** — no longer echo the heading 3×.

### Catalog
- **Reconciliation summary** — Added / Already-in-catalog / Total, each **counts up**;
  honest "No new songs" instead of a green check over "0 added"; real upload progress
  ("Uploading 128 / 300"). **List** — "Showing X of Y (N hidden)"; notes expand
  animates height; per-song color tint for scannability.

### Media
- **Image** — **blur-up reveal** (fade + scale + blur→0) like a developing photo;
  hover gradient + download preserved.
- **Sora video** — poster frame + play overlay + fade-in on `canplay` (was a black box);
  skeleton shows staged copy + elapsed timer for long renders.

### Revenue (YouTube)
- Headline **counts up**; **period delta chip** (+38%); daily **bars grow in** with a
  readable emerald gradient, best day highlighted; de-jargoned "Channel ID …"; a
  guided "Connect YouTube" card for permission errors.

### Connectors & monitoring
- **Composio** — tokenized CTA (was hardcoded blue), provider glyphs, and **no silent
  null** (always a sensible fallback card). **Pulse** — tone now follows real state
  (emerald only when on). **Sandbox / file** — terminal shimmer; file path row gets a
  hover open-affordance.

### Cross-cutting motion
- The ubiquitous flat `animate-pulse` was replaced with a **diagonal shimmer sweep**
  across skeletons; cards share one tasteful entrance; success moments get a small
  "land" micro-interaction. All motion respects `prefers-reduced-motion`.
