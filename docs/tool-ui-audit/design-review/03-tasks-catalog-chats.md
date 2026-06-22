# Design Review — Tasks, Catalog & Chats tool responses

Reviewer lens: senior product designer. Scope is the chat tool-response UI under
`components/VercelChat/tools/{tasks,catalog,chats}` plus
`components/shared/TasksSkeleton.tsx`. No component code was changed.

Two lenses per component:
- **A) Senior designer** — hierarchy, spacing, type, tone, and crucially MOTION
  (list stagger, row hover, status-pill transitions, schedule pill, upload
  progress, success confirmations) and how to make this feel like a crafted
  product rather than generic AI tool output.
- **B) Customer vs. higher-bar platforms** — Linear (tasks/scheduling), Notion,
  Raycast, Vercel. What feels generic / lacks taste.

Findings are `problem → proposed change → love/taste rationale`, prioritized
P0/P1/P2.

Shared building blocks reviewed for context: `shared/ToolCard.tsx`,
`shared/ToolCardSkeleton.tsx`, `shared/toolCardTokens.ts`,
`lib/tasks/parseCronToHuman.ts`, `lib/tasks/isRecurring.ts`. The card shell is
genuinely good: one consistent radius/border/shadow, tonal icon chips, a single
shared entrance motion (`opacity 0→1`, `y 6→0`, 0.28s, custom ease). The biggest
systemic gaps are (1) the data model carries `next_run` / `last_run` that the UI
never shows, and (2) almost no per-item motion — lists pop in as one block, rows
have only color hover, status changes are instant.

---

## TASKS

### Cross-cutting (applies to all task surfaces)

- **P0 — `next_run`/`last_run` exist in the schema but are never rendered.**
  `scheduled_actions` has `next_run` and `last_run` (`types/database.types.ts`
  ~L2517–2519), yet `TaskCard` shows only the cron-as-human string. A scheduling
  product lives or dies on "when does this actually fire next." → Add a "Next
  run" line to `TaskCard` (relative + absolute on hover/title, e.g. "Next run in
  4h · Tue 3:00 PM"), and surface `last_run` in the details dialog. *Trust in a
  scheduler comes from showing the next concrete moment, not just the rule.*

- **P1 — No timezone anywhere.** Cron is rendered with `cronstrue` default
  ("At 03:00 PM, only on Monday") with zero TZ context. A user in PT cannot tell
  if "3 PM" is theirs or UTC. → Append the resolved zone ("3:00 PM PT") wherever
  a time is shown. *Ambiguous times are the #1 way scheduling UIs lose trust.*

- **P1 — `parseCronToHuman` failure is silent and ugly.** On a parse error it
  `console.error`s (violates the repo's "No Production Logging" principle) and
  returns the raw cron string, which then renders inside a "schedule" pill as
  e.g. `0 3 * * 1` — looks broken to the user. → Drop the console.error; on
  failure render a neutral "Custom schedule" label with the raw cron in a
  tooltip. *Never show a user a regex where a sentence belongs.*

---

### `tasks/GetTasksSuccess.tsx`

**A) Senior designer**
- P1 — List has no stagger. `tasks.map` renders inside a static `divide-y`
  container; all rows appear in the same frame as the card. → Wrap rows in a
  framer-motion container with `staggerChildren: 0.04` and a small per-row
  `y: 4 → 0`. Cap stagger (e.g. first 8 rows) so long lists don't feel slow.
  *A gentle cascade reads as "assembled for you," not "dumped."*
- P2 — `max-h-80` scroll has no affordance. The list silently clips with a hard
  edge. → Add a top/bottom fade mask (`mask-image` linear-gradient) when
  scrollable. *The fade is the difference between "list" and "scrollable list."*
- P2 — Header count is duplicated: subtitle says "3 scheduled tasks" AND a `3`
  pill sits in `trailing`. → Drop the pill, or drop the number from the subtitle
  and keep the pill; don't say the same number twice. *Redundancy reads as a
  template that nobody curated.*

**B) vs. higher-bar platforms**
- Linear's "My Issues" / scheduled views always lead with *when* and *status*,
  not just a title + rule. This list is title-forward with the schedule demoted
  to a muted pill — it reads like a generic "here are your rows" dump. → Promote
  next-run; consider grouping ("Today / This week / Later") once next_run is
  available. *Grouping by time is what makes a schedule feel like a calendar
  rather than a table.*

---

### `tasks/TaskCard.tsx`

**A) Senior designer**
- P0 — Schedule legibility: the only schedule signal is one truncated muted
  pill (`parseCronToHuman` inside a `text-xs text-muted-foreground` pill that
  can `truncate`). For a recurring weekly task this can clip to "At 03:00 PM, on
  Mon…". → Give schedule its own line (not a pill), full width, with recurrence
  icon + human text + next-run; reserve pills for status only. *The single most
  important fact about a task should not be the thing that truncates first.*
- P1 — Status pill swaps to hover actions via `group-hover:hidden`. That's a
  hard show/hide with no transition, and it means **status disappears the moment
  you reach for an action** — you lose context exactly when acting. → Cross-fade
  instead (status fades to ~0 opacity, actions fade in) OR keep status visible
  and place actions to its left. *Information shouldn't vanish under the cursor;
  taste is in the transition, not the toggle.*
- P1 — The "Edit" pencil button (L116–121) has no `onClick` — it's a dead
  control that looks actionable. The row is wrapped in `TaskDetailsDialog` so
  clicking the row edits, but a labeled Edit button that does nothing is a trust
  bug. → Either wire it or remove it. *A button that lies about being clickable
  is the opposite of craft.*
- P1 — No optimistic/transition state for pause & delete beyond text swap
  ("Pause" → "Pausing…"). The card itself doesn't react. → On pause, animate the
  status pill amber and dim the row; on delete, animate height/opacity collapse
  (`AnimatePresence`) so the row physically leaves. *Satisfying confirmations
  are spatial, not just textual.*
- P2 — `rounded-xl` row inside a `rounded-2xl` card with `divide-y` produces
  slightly awkward corners at the first/last row against the divider. → Use
  consistent inner radius or remove row radius and rely on hover bg. *Nested
  radii that don't nest cleanly is a classic "almost" detail.*
- P2 — Artist avatar fallback is a generic `Clock` icon (`TaskArtistImage`),
  identical to the recurrence/one-off icon used in the schedule pill — two
  different meanings, one glyph. → Use initials or a music/person glyph for the
  avatar fallback. *Reusing one icon for two concepts muddies the visual
  language.*

**B) vs. higher-bar platforms**
- Linear rows: status as a colored state, assignee avatar, due/next as a
  first-class right-aligned column, all aligned on a strict grid. Here the right
  side is a single pill that *also* hosts hover actions, so alignment shifts on
  hover. → Adopt a stable right rail: fixed-width status + next-run column,
  actions in an overflow that doesn't reflow layout. *No-layout-shift-on-hover
  is a hallmark of a loved interface.*
- Notion/Linear use a real owner avatar; `ownerEmail` here is a raw email in a
  muted pill (only in shared/admin contexts). → Avatar + name, email on hover.
  *Raw emails in the UI read as a debug view.*

---

### `tasks/CreateTaskSuccess.tsx`

**A) Senior designer**
- P1 — "Created" doesn't *feel* created. It uses the same `ToolCard` entrance
  as every other card; the only success signal is a green `Plus` chip + copy.
  → Add a one-shot success flourish on mount: chip does a quick scale/`Check`
  morph, or a brief emerald ring pulse on the card. *A creation moment deserves
  a half-second of delight; that's where "crafted" lives.*
- P1 — Icon mismatch: success tone but a `Plus` icon (means "add"), while the
  message says "scheduled and ready to run." → Use `CalendarCheck` /
  `CalendarClock` to tie the confirmation to *scheduling*. *The icon should
  confirm the noun (a schedule), not the verb (add).*
- P2 — Subtitle "Your task is scheduled and ready to run." is generic boilerplate
  and the most valuable confirmation — *when it first runs* — is absent. → "First
  run Tue at 3:00 PM PT · repeats weekly" using next_run. *Confirm the
  consequence, not just the action.*

**B) vs. higher-bar platforms**
- Linear/Vercel post-action toasts are quiet but specific ("Scheduled for
  Tue 3 PM"). This is a full card restating the task with generic praise copy.
  → Lead with the concrete next-run; the card body (TaskCard) already repeats
  details. *Specificity > congratulations.*

---

### `tasks/UpdateTaskSuccess.tsx`

**A) Senior designer**
- P1 — Indistinguishable from Create except tone (`info`/blue), icon (`Pencil`)
  and copy ("changes have been saved"). No sense of *what* changed. → Show a
  diff hint ("Schedule changed: weekly → daily" / "Renamed") when derivable, or
  at minimum re-emphasize the new next-run. *"Saved" is table stakes; "here's
  what changed" is the product.*
- P2 — Same lack of a confirmation micro-moment as Create (shares ToolCard
  entrance only). → A subtle blue ring pulse keyed to "update." *Distinct states
  should feel distinct, not just be tinted differently.*

**B) vs. higher-bar platforms**
- Notion/Linear show edited-time + actor on update. There's no "updated just now"
  timestamp here despite `updated_at` existing in the schema. → Surface "Updated
  just now." *Temporal feedback makes edits feel real.*

---

### `tasks/DeleteTaskSuccess.tsx`

**A) Senior designer**
- P1 — Deletion is a `warning` (amber) tone showing the deleted task at
  `opacity-70` with a "Deleted" badge — calm and correct, but there's no
  *removal* motion, and (unlike pause/delete inside TaskCard) no undo. → Animate
  the shown card with a strikethrough/desaturate settle on mount, and add an
  "Undo" affordance (deletes are the one place users panic). *Undo is the single
  most loved detail in any destructive flow.*
- P2 — Copy "removed and will no longer run" is good and trustworthy; keep it.
  Pair it with the now-cancelled next-run, struck through ("Was: Tue 3 PM").
  *Showing the future you cancelled makes the deletion legible.*

**B) vs. higher-bar platforms**
- Linear/Gmail: destructive action → inline snackbar with timed Undo. This card
  has none. *No-undo on delete is the clearest "no love here" tell.*

---

### `tasks/DeleteTaskSkeleton.tsx` & `shared/TasksSkeleton.tsx`

**A) Senior designer**
- P2 — Both are thin wrappers over `ToolCardSkeleton` (good reuse). But the
  skeleton's pulse and the loaded card's entrance aren't choreographed — the
  pulse stops, the card fades in from `y:6` again, so it double-animates. → Have
  the loaded card mount with `noAnimation` when it replaces a skeleton, or share
  a layoutId so it morphs. *Loading→loaded should be one continuous gesture, not
  two separate animations.*
- P2 — `DeleteTaskSkeleton` shows `rows={1}` of a generic avatar+two-line row;
  for a delete, a single-line "removing…" with a subtle red-tinted chip would
  set the right expectation. → Tint the skeleton chip per the pending action.
  *Even the wait should hint at the outcome.*

**B) vs. higher-bar platforms**
- Linear/Vercel skeletons match the final layout's column widths exactly. The
  task skeleton's generic 1/2 + 1/3 bars don't match TaskCard's title +
  schedule-pill rhythm, so there's a small reflow on load. → Mirror real widths.
  *Zero reflow on load is invisible craft people feel but can't name.*

---

### `tasks/TaskArtistImage.tsx`

**A) Senior designer**
- P2 — Image fade-in is nicely handled (`opacity` transition + pulse
  placeholder). But there's no error fallback — a broken `imageUrl` leaves the
  pulse forever (no `onError`). → Add `onError` → fall back to the Clock/initials
  state. *A perpetual shimmer is worse than an honest placeholder.*
- P2 — Fallback `Clock` collides semantically with the schedule icons (see
  TaskCard). → Initials or person glyph. *One glyph, one meaning.*

**B) vs. higher-bar platforms**
- Linear/Notion avatars use a deterministic color from the name for fallbacks
  (instant identity). A flat muted circle here is anonymous. → Hash name → tint.
  *Colored initials make a list scannable at a glance.*

---

### `tasks/TaskError.tsx`

**A) Senior designer**
- P1 — The error dedupe logic exists because callers pass the same string into
  `message`, `error`, and `title` (see Create/Update/Delete: all three are
  literally "Failed to Create Task"). So the "error detail" is just the title
  repeated → the user gets a title and a body that say the same thing with no
  actual cause. → Pass the real error/cause as `error`; keep `title` short
  ("Couldn't create task"). *An error with no cause is a dead end; the dedupe is
  a band-aid over empty content.*
- P2 — No retry. Failed create/update/delete just shows red text. → Offer a
  "Try again" affordance. *Recovery in place is the difference between a tool and
  a toy.*

**B) vs. higher-bar platforms**
- Vercel/Linear errors are specific + actionable ("Rate limited, retry in 30s").
  This is generic. *Specific errors signal a team that sweats failure states.*

---

## CATALOG

### `catalog/CatalogSongsResult.tsx` (orchestrator)

**A) Senior designer**
- P1 — The result is a bare `flex flex-col` stack of sub-cards, NOT wrapped in
  `ToolCard`. So catalog import looks visually different from every other tool
  response (no header chip, no entrance motion, different max-width `max-w-xl`).
  → Wrap in `ToolCard` (icon `ListMusic`, title "Catalog import") for
  consistency. *A tool that doesn't wear the system uniform reads as bolted-on.*
- P1 — Upload progress (L84–90) is a flat `Progress` bar + "Uploading… 42%".
  It's functional but joyless and the count of rows processed
  (`uploadProgress.current/total`) is hidden behind a percentage. → Show
  "Uploading 128 / 300 songs" with the bar, and animate the % with
  `tabular-nums` already in place; on complete, morph bar → green check.
  *Counting up real rows feels like work being done; a naked % feels like a
  spinner.*
- P2 — Order of operations is odd: status → summary → toggle → list → upload
  button. The primary CTA (upload) sits at the *bottom* under a potentially long
  list. → For the empty/initial state, lead with the upload affordance.
  *Put the next action where the eye lands first.*

**B) vs. higher-bar platforms**
- A great CSV import (Linear/Notion/Airtable) shows a clear post-import
  reconciliation: "300 rows · 280 added · 15 skipped · 5 duplicates." Here the
  summary only has "Songs processed" + "Total in catalog" (see Summary below) —
  inserted vs skipped vs matched is not represented. *Import without a
  reconciliation summary is the biggest taste gap in this whole set.*

---

### `catalog/InsertCatalogSongsSummary.tsx`

**A) Senior designer**
- P0 — Only two stats: `total_added` ("Songs processed") and
  `pagination.total_count` ("Total in catalog"). The brief explicitly wants
  inserted / skipped / matched to feel like a clear data summary, and that
  breakdown is absent. → Add chips/segments for Added, Skipped, Duplicates/
  Matched with color coding (emerald/amber/muted) once the data is available.
  *A summary that can't tell you what was skipped doesn't answer the user's real
  question after an import.*
- P1 — "Songs processed" is ambiguous (processed = added? attempted?). → Rename
  to the precise verb ("Added to catalog"). *Vague stat labels erode confidence
  in the numbers.*
- P2 — Stat chips don't animate. A count-up (`0 → 300`) on mount would make the
  summary land. → Animate the number. *Numbers that tick up feel earned.*

**B) vs. higher-bar platforms**
- Vercel deploy summaries and Linear import results use a tight stat strip with
  semantic color. Two neutral grey chips here read generic. *Color is meaning;
  all-grey stats waste the chance to communicate at a glance.*

---

### `catalog/InsertCatalogSongsStatus.tsx`

**A) Senior designer**
- P1 — Success/error pill is static; it appears with the card and never
  transitions even though it represents the *outcome* of an async upload. → On
  upload completion, animate the check drawing in (scale + a quick spring) so
  success feels confirmed, not pre-rendered. *The check should arrive, not
  already be there.*
- P2 — Success copy fallback "Songs added to catalog" can show even when 0 were
  added (status is driven by `hasError`, not by count). → Gate wording on count
  ("No new songs — all already in catalog"). *A green check over "0 added" is a
  small lie.*

**B) vs. higher-bar platforms**
- Raycast/Linear success states use restrained motion + precise copy. The error
  fallback "Something went wrong adding songs" is the generic non-message users
  hate. *Generic error copy is the tell.*

---

### `catalog/InsertCatalogSongsList.tsx`

**A) Senior designer**
- P1 — `ul` with `divide-y` renders all rows at once; newly inserted songs don't
  stagger or highlight. → Stagger rows in; for a fresh import, briefly flash
  newly-added rows (emerald left-border that fades). *"What did my upload add?"
  answered visually beats a footer count.*
- P2 — Footer "Showing N songs" duplicates the summary's processed count and
  doesn't reflect filtering vs total well (it shows filtered count after the
  Hide-incomplete toggle, with no "of M"). → "Showing 12 of 300 (288 hidden)."
  *Filtered counts must always say what's hidden, or the toggle feels like data
  loss.*

**B) vs. higher-bar platforms**
- Notion/Airtable always show "X of Y" under a filter. A bare "Showing 12 songs"
  after toggling a filter makes users wonder where their rows went. *Honest
  count math under filters is basic respect for the user's data.*

---

### `catalog/CatalogSongRow.tsx`

**A) Senior designer**
- P1 — Notes expand/collapse is instant (`isExpanded` swaps a `<p>` in/out, no
  height animation). → Animate height with `AnimatePresence`/`layout`. *A snap
  open feels like a `display:none` toggle; a slide feels designed.*
- P2 — Artwork is always the same `Disc3` placeholder (comment notes the table
  has no cover art). Every row identical kills scannability. → Deterministic
  color tint per song/artist behind the disc glyph. *Variation gives the eye
  anchors in a long list.*
- P2 — "No ISRC" amber chip is good (legible missing-data signal). But it sits
  in the same row of pills as the interactive "Notes" button with identical
  size/shape — a status and a control look alike. → Differentiate the control
  (chevron, hover affordance) from the status pill. *Controls and labels should
  never be confusable.*

**B) vs. higher-bar platforms**
- Linear/Notion rows reveal a hover action rail (open, copy ID). This row has no
  hover affordance at all (the `ToolCardRow` hover bg exists but nothing to do).
  → Add copy-ISRC / open-song on hover. *Hover affordances are what make a list
  feel alive.*

---

### `catalog/CatalogSongsSkeleton.tsx`

**A) Senior designer**
- P2 — Label "Processing catalog songs…" (note: real ellipsis char, good) but
  the 4 generic rows don't match `CatalogSongRow`'s layout (disc + title + pills
  + footer). → Mirror the row anatomy incl. the pill area. *Skeleton fidelity is
  what makes load feel instant.*

**B) vs. higher-bar platforms**
- Same reflow-on-load critique as TasksSkeleton. *Match the final layout exactly.*

---

### `catalog/HideMissingItemsToggle.tsx`

**A) Senior designer**
- P2 — Solid, clear (Filter icon + live "Hiding…/Showing…" label + Switch).
  Minor: the descriptive text and the Label ("Hide incomplete") slightly compete
  — two pieces of text about the same control. → Keep the live status text; make
  the Label visually secondary or merge. *One control, one primary label.*
- P2 — No count of what's hidden inline. → "Hide incomplete (288 hidden)."
  *Tie the toggle to its consequence.*

**B) vs. higher-bar platforms**
- Good parity with Linear/Notion filter chrome. Closest-to-done component here.

---

### `catalog/CatalogCsvUploadButton.tsx`

**A) Senior designer**
- P1 — It's a dashed box with a button but no real drag-and-drop (only a hidden
  file input + click). A dashed dropzone strongly signals "drop here" and then
  doesn't accept drops. → Implement actual drag/drop with a dragover highlight,
  or drop the dashed-dropzone styling and use a plain button. *A dropzone that
  rejects drops is a broken promise the styling makes.*
- P2 — Disabled state (no catalog) shows a destructive-red helper sentence but
  the button just greys out — the *why* and the *fix* aren't connected. → Make
  the message the primary affordance ("Select a catalog to enable upload"),
  consider a link to do so. *Disabled controls must explain themselves.*
- P2 — `redundant onClick + label htmlFor` both trigger the input (the label
  wraps the button which also calls `inputRef.click()`), risking a double-open
  on some browsers. → Pick one mechanism. *Two handlers for one action is a
  latent bug and a code-smell reviewers notice.*

**B) vs. higher-bar platforms**
- Vercel/Linear import affordances support drag-drop + show accepted format and
  a sample. Here the format hint is good (`isrc` code chip), drag-drop is the
  gap. *Real drag-drop is expected table stakes for CSV import in 2026.*

---

## CHATS

### `chats/GetChatsResult.tsx`

**A) Senior designer**
- P1 — Rows show only an icon + title + hover chevron. No timestamp even though
  `updatedAt` is in the row type. A chat list with no "when" is hard to scan. →
  Right-align a relative time ("2h ago"). *Recency is the primary sort key in any
  chat list; hiding it wastes the data you already have.*
- P1 — Every row leads with the same `MessageSquare` icon (also the header icon).
  Visually monotonous; the icon carries no per-row information. → Drop the
  per-row icon or replace with a recency dot / unread marker. *A column of
  identical icons is decoration, not information.*
- P2 — Hover chevron slide-in is a nice touch (the one bit of per-row motion in
  the whole set). Keep it. But the list itself doesn't stagger in. → Add the
  shared stagger. *Consistency: if tasks/catalog get stagger, chats should too.*

**B) vs. higher-bar platforms**
- Linear/Notion/Raycast list items: title + secondary line (preview/snippet) +
  timestamp + subtle metadata. This is title-only — the thinnest possible row. →
  Add a snippet (last message) line if available, plus time. *A single-line row
  is the definition of generic list output.*

---

### `chats/GetChatsSkeleton.tsx`

**A) Senior designer**
- P2 — No `label` passed (unlike Tasks/Catalog skeletons which say what's
  loading), so it shows a generic bar instead of "Loading chats". → Pass
  `label="Loading chats"` for parity. *Tell the user what they're waiting for.*

**B) vs. higher-bar platforms**
- Fine as a generic skeleton; same match-final-widths note applies.

---

## TOP 8 — highest-leverage fixes

1. **P0 — Surface `next_run` (and `last_run`) on tasks.** The scheduler's whole
   value is "when does this fire next," and the data exists but is invisible.
   Add Next-run to TaskCard + Create/Update/Delete confirmations and the details
   dialog.

2. **P0 — Make the catalog import a real reconciliation summary.** Add
   Added / Skipped / Duplicates(matched) stat chips with semantic color;
   "Songs processed" alone doesn't answer what happened to the upload.

3. **P0 — Fix schedule legibility in TaskCard.** Move the human schedule out of
   a single truncating muted pill onto its own line with recurrence icon +
   next-run + timezone; never let the raw cron string leak into the UI.

4. **P1 — Differentiate & add micro-moments to Create / Update / Delete.** A
   green-ring/scale flourish on create, a "what changed" + updated-time on
   update, and a removal animation + **Undo** on delete. Right now they differ
   only by tint and copy.

5. **P1 — Add per-item motion across all three domains.** Staggered list-in for
   GetTasks / Chats / catalog list, animated notes expand, status-pill
   cross-fade (not `group-hover:hidden`), and animated stat/count-ups.

6. **P1 — Kill dead/false-promise controls.** The non-wired Edit pencil in
   TaskCard, and the dashed "dropzone" that doesn't accept drops in
   CatalogCsvUploadButton. Either implement or remove.

7. **P1 — Fix error & count honesty.** TaskError currently dedupes a title
   repeated three times (pass a real cause + retry); catalog success can show a
   green check over "0 added"; filtered list count needs "X of Y (N hidden)".

8. **P1 — Enrich the Chats row + show time.** Add `updatedAt` as a relative
   timestamp, drop the repeated per-row MessageSquare icon, optionally add a
   snippet line so it stops reading as one-line generic AI output.
