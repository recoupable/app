# Chat Tool-Response UI — User Journeys & Audit

> Owner: Frontend / Chat Experience
> Status: living document — updated each design pass ("award-winning" loop)
> Companion data: [`tool-ui-audit.csv`](./tool-ui-audit.csv) (the running spreadsheet)

This document captures, for every chat **tool response** surfaced in the
assistant message stream, the intended **user journey**, the **customer
expectation**, the **prior reality** (what shipped before this pass), and the
**target** ("award-winning") bar. The per-component, per-state tracking lives in
the CSV spreadsheet next to this file.

---

## How tool responses render

```
MessageParts.tsx
  └─ isToolOrDynamicToolUIPart(part)
       ├─ state === "output-error"     → getToolErrorComponent()   ← NEW (was unhandled)
       ├─ state !== "output-available" → getToolCallComponent()    (loading / skeleton)
       └─ state === "output-available" → getToolResultComponent()  (result)
```

Every tool therefore has up to **four UI states** we must design:

1. **Loading / call** — the tool is running (`input-streaming`, `input-available`).
2. **Success** — `output-available` with data.
3. **Empty** — `output-available` with zero results.
4. **Error** — `output-error` (and in-component data guards).

### The shared design system (this pass)

To make the surface feel intentional rather than a patchwork, all tool cards now
build on a small set of primitives in
`components/VercelChat/tools/shared/`:

| Primitive | Purpose |
| --- | --- |
| `ToolCard` | The single card shell: tinted icon chip header, title/subtitle, trailing slot, tonal accents, entrance motion. |
| `ToolCardBody` / `ToolCardRow` | Consistent padded body + hoverable rows. |
| `ToolCardSkeleton` | Loading shell that mirrors `ToolCard` anatomy (no layout jump). |
| `ToolEmpty` | Friendly zero-results state used inside a card. |
| `ToolError` | Unified failure state with optional retry. |
| `ToolStatusPill` | Compact animated "tool is running" pill (default loading affordance). |
| `toolCardTokens` | Shared tonal palette (`neutral/success/error/info/accent/warning`) + motion. |

---

## Cross-cutting findings (fixed this pass)

| # | Finding | Severity | Resolution |
| --- | --- | --- | --- |
| X1 | **Error state never rendered.** `MessageParts` treated any non-`output-available` state as "loading", so a tool that hit `output-error` showed its loading skeleton **forever**. | High | Added `output-error` branch → `ToolError` with retry wired to `reload()`. |
| X2 | **Inconsistent card language.** Tools mixed raw `div`s, `Card`, ad-hoc headers, three different "green check" patterns, varied radii/shadows/spacing. | High | Introduced `ToolCard` design system; migrated tools onto it. |
| X3 | **Skeletons didn't match results**, causing layout jump on resolve. | Medium | `ToolCardSkeleton` mirrors `ToolCard`; per-tool skeletons aligned. |
| X4 | **Weak default states.** Default loading = static "Using {tool}" chip; default success = tiny plain card; many tools had no empty state. | Medium | `ToolStatusPill` (animated) + redesigned `GenericSuccess` + `ToolEmpty`. |
| X5 | **Hardcoded colors** (`red-50`, `text-red-600`, `white`) broke dark mode. | Medium | Standardized on design tokens + tonal palette. |

---

## User journeys by tool domain

Each journey: **Trigger → Expectation → Reality (before) → Target (after)**.

### 1. Music intelligence (Spotify)
- **Tools:** `get_spotify_search`, `get_spotify_artist_albums`,
  `get_spotify_artist_top_tracks`, `get_spotify_album`, `spotify_deep_research`.
- **Journey:** A manager asks "how's this artist doing on Spotify?" and expects a
  scannable, visual answer — artwork, track/album names, popularity, links back
  to Spotify — not a wall of text.
- **Expectation:** Rich media cards resembling a music app; clear loading;
  graceful "no results".
- **Reality (before):** Functional lists, inconsistent headers, some plain text,
  skeletons that didn't match, brittle error fallbacks.
- **Target:** Consistent music cards with artwork thumbnails, popularity/duration
  meta, trailing counts, mirrored skeletons, `ToolEmpty`/`ToolError`.

### 2. Tasks & automation
- **Tools:** `get_tasks`, `create_task`, `update_task`, `delete_task`,
  `get_task_run_status`, `prompt_sandbox`.
- **Journey:** A user schedules recurring work and wants confidence it's set up,
  when it runs next, and which artist it's for.
- **Expectation:** Clear confirmations, readable schedules (cron → human), the
  affected task summarized, obvious success/destructive cues.
- **Reality (before):** Repeated "green check + Tasks" header, cron shown raw in
  places, delete had a thin skeleton, no unified error.
- **Target:** Task cards with schedule pills, artist avatars, tonal success
  (create=success, delete=warning), mirrored skeletons.

### 3. Catalog management
- **Tools:** `select_catalog_songs`, `insert_catalog_songs`.
- **Journey:** A user uploads/links a song catalog and wants to see what matched,
  what was inserted, and what was skipped.
- **Expectation:** Per-song rows with artwork + match status, summary stat chips
  (inserted / skipped / total), a clear upload affordance.
- **Reality (before):** Dense rows, status as plain text, summary counts not
  emphasized.
- **Target:** Song rows with artwork/placeholder + status pills, stat-chip
  summary, styled upload button + toggle.

### 4. Conversations
- **Tool:** `get_chats`.
- **Journey:** "Show my recent chats" → tap through to one.
- **Expectation:** A tidy, tappable list with titles and clear navigation.
- **Reality (before):** Decent card but bespoke; no shared language.
- **Target:** `ToolCard` with count badge, hover rows + chevron, `ToolEmpty`.

### 5. Artist profile & socials
- **Tools:** `create_new_artist`, `get_artist_socials`, `update_account_info`,
  `update_artist_socials`.
- **Journey:** Onboard/curate an artist; confirm socials are linked.
- **Expectation:** Avatar + name confirmations; socials as a clean platform grid
  with handles/followers and links.
- **Reality (before):** Mixed; socials list functional but plain; thin error text.
- **Target:** Hero/avatar success cards; platform rows with icons + links;
  shared error look.

### 6. Web research
- **Tool:** `search_web` (+ progress updates).
- **Journey:** "Find recent press on X" → review sources, click through.
- **Expectation:** A "Sources · N" list with domain/favicon, title, snippet,
  date; visible in-progress state.
- **Reality (before):** Plain "Reviewing sources · N" + simple items; basic
  skeleton.
- **Target:** Source rows with favicon/domain, line-clamped snippet, dates,
  elegant progress with query pills, mirrored skeleton.

### 7. Media generation
- **Tools:** `generate_image`, `edit_image`, `retrieve_sora_2_video_content`,
  `generate_txt_file`.
- **Journey:** Generate an image/video/file and download it.
- **Expectation:** A framed, downloadable asset with hover affordances; clear
  loading; clear failure.
- **Reality (before):** Image card good but error used `red-50/red-600`
  (dark-mode unsafe); video lazy-loaded; txt file basic.
- **Target:** Framed media with download, token-based error via `ToolError`,
  aspect-correct skeletons.

### 8. Connectors & monitoring
- **Tools:** `COMPOSIO_MANAGE_CONNECTIONS`, `get_pulses`, `update_pulse`,
  `get_youtube_revenue`.
- **Journey:** Connect an integration / check a pulse / read YouTube revenue.
- **Expectation:** Clear connect CTA, connected confirmation, and a revenue
  **stat card** (headline figure + period + daily breakdown).
- **Reality (before):** Composio result generic; YouTube revenue had a separate
  error card with different styling.
- **Target:** Connect/connected states on the shared system; revenue stat card
  with stat chips + daily rows; unified error look.

---

## Award-winning checklist (applied per component)

- [ ] Uses the shared `ToolCard` system (consistent radius, border, shadow, header anatomy).
- [ ] All four states designed: loading, success, empty, error.
- [ ] Skeleton mirrors the resolved layout (no jump).
- [ ] Dark-mode safe (design tokens only; no hardcoded colors).
- [ ] Content truncates / line-clamps gracefully; responsive widths.
- [ ] Accessible: semantic structure, alt text, focusable links, keyboard-friendly.
- [ ] Tasteful motion (entrance only; no distracting animation).
- [ ] Real media (artwork/favicons/avatars) used where data provides it.
