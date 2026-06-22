# Tool-UI Design Review — 01: Core Primitives & Non-Technical Clarity

Reviewer: Senior product designer (Linear / Vercel / Raycast / Arc bar)
Scope: shared tool-card primitives, the generic/MCP/dynamic-tool fallback path, and streaming/loading behavior.
Status: **notes only — no component code was changed.**

Files reviewed:
- `components/VercelChat/tools/shared/ToolCard.tsx`
- `components/VercelChat/tools/shared/ToolCardSkeleton.tsx`
- `components/VercelChat/tools/shared/ToolEmpty.tsx`
- `components/VercelChat/tools/shared/ToolError.tsx`
- `components/VercelChat/tools/shared/ToolStatusPill.tsx`
- `components/VercelChat/tools/shared/toolCardTokens.ts`
- `components/VercelChat/tools/GenericSuccess.tsx`
- `components/VercelChat/getToolCallComponent.tsx`
- `components/VercelChat/getToolResultComponent.tsx`
- `components/VercelChat/getToolErrorComponent.tsx`
- `components/VercelChat/toolCallSkeletons.tsx`
- `lib/tools/getToolInfo.ts`
- `lib/tools/humanizeToolName.ts`
- `components/VercelChat/MessageParts.tsx`, `components/VercelChat/messages.tsx`

---

## TL;DR — Top 8 highest-impact recommendations

1. **[P0] The default/MCP path is the product's weakest moment.** An unknown tool (e.g. `Bash`) renders as "Bash" → "Running Bash" → "Bash / Data processed" with no description and no visible input. To a non-technical music manager this reads as a frozen loop. Fix with a description registry + plain-English one-liner + the actual input arg surfaced (verb + object). This is the single biggest credibility risk in the whole tool surface.
2. **[P0] Surface `part.input` everywhere.** The data is already on the part (`part.input` for args, `part.output` for results) but the fallback UI throws it away. Showing "Running command · `npm test`" instead of "Running Bash" instantly turns repeated identical-looking calls into distinct, intentional steps.
3. **[P0] Loading → success is a hard swap, not a transition.** The skeleton/pill and the success card are different components mounted/unmounted with independent entrance animations, so the user sees a flash-and-replace rather than a card that "settles." Add a shared `layout`/`AnimatePresence` crossfade and (ideally) keep the same card shell across states.
4. **[P1] No completion micro-interaction.** Nothing marks the moment a tool succeeds — the success checkmark just appears. A 1-frame checkmark draw-in / tone sweep is the cheap, high-taste detail that Linear/Raycast nail and ChatGPT does not.
5. **[P1] Repeated calls don't read as a sequence.** Three `Bash` cards stack identically with no step numbering, no grouping, no connective tissue. Add step indices and/or a vertical "run" rail so a chain of calls looks deliberate.
6. **[P1] `getToolInfo` is a brittle if/else with generic fallbacks ("Data processed").** Convert to a keyed registry of `{ icon, tone, label, verb, describe(input), summarize(output) }` with prefix/category matching and a graceful generic fallback. This is the structural unlock for items 1, 2, 5.
7. **[P2] Tone/color is under-used as information.** Almost every fallback is `success` green or neutral. Map tool *categories* (read/search = blue, write/mutation = violet/amber, external/destructive = amber) so the user can pre-attentively tell "it looked something up" from "it changed my data."
8. **[P2] Motion is generic and competitor-indistinct.** Same fade-rise on every card, a linear shimmer, a spinner. Nothing says "music." Introduce a small, restrained signature (e.g. an equalizer-bar loader, a waveform shimmer) used sparingly so the agent feels crafted for this domain rather than a generic chat wrapper.

---

## A) Senior designer review

### A1. `ToolCard.tsx` — the shell

**What's good:** single shared shell, tonal chip system, `max-w-xl`, consistent radius/border/shadow, one entrance animation. This is a solid foundation — most of the love should go *into* it, not around it.

**Findings:**

- **[P1] Entrance animation is correct but isolated.** `toolCardMotion` (fade + 6px rise, 280ms, nice easing) is good, but every card animates independently on mount. When a skeleton unmounts and a result mounts, both play their own entrance → a visible double-animation / flash.
  - *Problem:* loading→success feels like a swap, not a state change.
  - *Change:* wrap state transitions in `AnimatePresence mode="popLayout"` and give the shell a stable `layoutId` per `toolCallId` so the card morphs (height + content crossfade) instead of unmount/mount. Crossfade body content over ~180ms; let height animate via `layout`.
  - *Love rationale:* great tools make the object feel continuous — one card that "thinks then resolves," not two cards swapped behind your back.

- **[P1] No hover affordance beyond shadow.** `hover:shadow-md` is the only interactive feedback, and the header isn't a button.
  - *Change:* make the header a real toggle when there's collapsible content (chevron that rotates 180° on open, 150ms), and add a 1px border-color lift on hover, not just shadow. Cursor + focus-visible ring for keyboard users.
  - *Love rationale:* Linear/Raycast rows always tell you "this is pokeable" before you poke it.

- **[P2] `loading` prop only pulses the chip.** The pulse is a blunt instrument and looks identical to the skeleton's pulse.
  - *Change:* reserve a dedicated in-card progress treatment (thin indeterminate top-border shimmer on the card, à la Vercel/YouTube) for the "card already mounted, still working" case.
  - *Love rationale:* progress should live on the object that's working, not in a detached pill.

- **[P2] Title is always `text-sm font-semibold` and single-line truncate.** Fine, but for the default path the title is doing too much work alone (see clarity section). Header anatomy should support: **eyebrow/category** (tiny, uppercase, muted) + **title** (verb + object) + **subtitle** (plain-English description). Today there's no eyebrow slot.
  - *Change:* add an optional `eyebrow` prop (xs, tracking-wide, muted-foreground) so category ("Shell command", "Database", "Web") can sit above the action.

- **[P2] `trailing` slot lacks a standard "duration / timestamp" treatment.** Tasteful tool UIs show elapsed time ("1.2s") on completion — quietly. There's no shared component for it.
  - *Change:* add a `ToolMeta` trailing helper (mono, xs, muted) for duration/count so every card reports cost-of-action consistently.

### A2. `ToolCardSkeleton.tsx`

- **[P1] Skeleton anatomy doesn't match the real header exactly.** Skeleton uses `items-center` in the header; `ToolCard` uses `items-start`. Skeleton chip has no tone; real chip is tinted. Result: a subtle vertical shift + color pop on resolve.
  - *Change:* align alignment, chip tone, and label typography 1:1 with `ToolCard`. The skeleton should be the *same card* with placeholder content, ideally literally rendering `ToolCard` with skeleton children.
  - *Love rationale:* "no layout jump" is promised in the file's own docstring but not fully delivered — close the gap.

- **[P2] Pulse is the only loading signal.** Three rows of pulsing bars is the generic ChatGPT/Claude look.
  - *Change:* add a single, subtle shimmer sweep (reuse the pill's gradient sweep) and stagger row opacity so it reads as "filling in," not "blinking."

### A3. `ToolStatusPill.tsx`

- **[P1] The pill is detached from the card design language.** It's a rounded chip floating in the message flow; when it resolves, a full card appears in its place — a jarring shape change (pill → rounded-2xl card).
  - *Change:* either (a) make the running state a *card in loading tone* so the silhouette is stable through resolve, or (b) make the pill the persistent header that the card grows out of. Don't go pill → card.
  - *Love rationale:* shape continuity is the difference between "it transformed" and "it got replaced."

- **[P2] Spinner + linear shimmer is the generic default.** It's competent but anonymous.
  - *Change (signature motion):* swap the spinner for a 3-bar equalizer loader (music-native), and make the shimmer a soft left-to-right "scrub" easing rather than `linear`. Keep it subtle — one signature element, not a light show.
  - *Love rationale:* this is the cheapest place to make the agent feel built for music, not generic chat.

- **[P2] Label is the only content.** "Running Bash" with nothing else is the loop-illusion (see clarity). Pill should carry **verb + object**.

### A4. `ToolError.tsx` / `ToolEmpty.tsx`

- **[P1] Error retry depends on `onRetry`, which is only passed for the latest, non-streaming message** (`MessageParts.tsx`). Historical errors therefore show no recovery path and read as dead ends.
  - *Change:* always offer at least a secondary action ("Ask agent to retry" that injects a follow-up, or "Copy error"). Never leave a failure with zero affordances.

- **[P2] Error copy is generic.** "The tool ran into a problem" + raw `errorText`. For non-technical users, raw stack/JSON errors are noise.
  - *Change:* show a friendly first line from the registry ("Couldn't run that shell command"), collapse the raw `errorText` behind a "Details" disclosure. Same registry that powers descriptions powers friendly error verbs.

- **[P2] `ToolEmpty` is solid** but uses a circular muted icon while everything else uses a rounded-square tinted chip — minor inconsistency. Align the icon container to the card chip language.

### A5. `toolCardTokens.ts`

- **[P2] Good token system, under-exploited.** Six tones exist; the fallback path only ever uses `success`/`neutral`/`error`.
  - *Change:* define a **category → tone** map (read/search → `info`, retrieval of media → `accent`, mutations → `warning`/`accent`, external send → `accent`) and drive it from the registry so color carries meaning.

- **[P2] Motion token is a single object.** Add named variants: `cardEnter`, `cardResolve` (crossfade), `pop` (success check), `rail` (sequence). Centralize easing so motion stays coherent as more tools are added.

---

## B) Customer vs. higher-bar platforms

How this surface reads next to products with more taste:

- **vs. Linear:** Linear's activity/inline cards have a strong sense of *object permanence* and crisp state transitions; here, loading→success is a mount/unmount swap. Linear also nails the quiet "duration / who / when" metadata — absent here.
- **vs. Raycast:** Raycast results feel *keyboard-first and pokeable* with instant, springy micro-interactions and a completion "snap." Our cards have one entrance animation and no completion moment — they arrive but never *land*.
- **vs. Vercel:** Vercel's build/log UI shows **what is actually happening** (the command, the step, streaming output, elapsed time). Our default path shows a humanized noun and "Data processed." This is the single biggest taste gap.
- **vs. Arc:** Arc's command bar has a confident, minimal, *branded* motion vocabulary. Ours is generic spinner + linear shimmer — indistinguishable from any AI SDK starter.
- **vs. Perplexity:** Perplexity makes tool steps legible to non-experts ("Searching…", "Reading sources…") with visible inputs. Our running labels are close in spirit but stop at the verb and never show the object.
- **vs. Spotify:** zero domain texture. For a music-industry agent, there is no visual signal anywhere that this is a music product — same chips a generic ChatGPT clone would ship.

**What feels generic / lacks love (specifics):**
- Spinner + linear-eased shimmer + pulse-bars = the default AI-SDK aesthetic.
- Every fallback success is the same green check + "Data processed."
- No elapsed time, no step numbering, no input echo, no domain motif.
- Pill→card shape change on resolve.
- Skeleton ≠ final card anatomy (alignment + tone mismatch).

---

## CRITICAL FOCUS — non-technical clarity for the DEFAULT / MCP / dynamic-tool path

### The problem, concretely

Today an unknown/MCP tool flows: `getToolCallComponent` → no skeleton match → `<ToolStatusPill label="Running Bash" />`; then `getToolResultComponent` → no match → `<GenericSuccess name="Bash" message="Data processed" />`. So the manager sees:

```
[spinner] Running Bash
...
[✓] Bash
    Data processed
```

…and if the agent calls `Bash` three times, three identical "Running Bash → Bash / Data processed" cards stack. **It looks broken or stuck in a loop.** The cards are visually indistinguishable even though each call did something different, and nothing tells a non-technical user what "Bash" even is.

### Where the data already lives (no backend change needed)

- **Inputs:** `part.input` is present on both `ToolUIPart` and `DynamicToolUIPart`. For MCP it's the tool's arg object (e.g. `{ command: "npm test" }`, `{ query: "..." }`, `{ url: "..." }`, `{ path: "..." }`). `getToolResultComponent` already reads `part.input` for `get_task_run_status` — proof the pattern is available.
- **Outputs:** `part.output` (for MCP, `JSON.parse(output.content[0].text)` as already done at the top of `getToolResultComponent`).
- **Name:** `getToolOrDynamicToolName(part)`.

None of this requires new server data — it's all on the part and currently discarded by the fallback.

### Proposed UI

**1. Friendly label + one-line plain-English explanation.**
Header becomes three tiers using a description registry:
- *Eyebrow (category):* `SHELL COMMAND` / `WEB` / `DATABASE` / `EMAIL`
- *Title (verb + object):* `Ran command · npm test`
- *Subtitle (plain English):* "Runs a command on the server to set things up or check results."

So instead of "Bash / Data processed":
```
SHELL COMMAND                                   1.2s
Ran command · npm test
Runs a command to set things up or check results.
  ▸ Output (collapsed)
```

**2. Show WHAT the tool did this call (input echo + collapsible output).**
- Surface the **key input arg** inline in title/subtitle via a per-category extractor: prefer `command` → `query` → `url` → `path` → `name` → first string value. Render in mono, truncated mid-string so distinct calls look distinct.
- Render `part.output` in a **collapsible** "Output" disclosure (default collapsed, mono, max-height with fade + "show more"). Non-technical users can ignore it; power users can expand. This alone kills the loop illusion — three calls now read `npm install`, `npm test`, `npm run build`.

**3. Visually group/sequence repeated calls.**
- Add a **step index** when the same tool (or a run of tool calls) repeats in one assistant turn: `Step 2 · Ran command · npm test`. (Index can be derived in `MessageParts` from the part's position among tool parts, or by counting prior same-name calls.)
- Optionally render consecutive tool cards connected by a thin vertical **rail** (like a timeline) so a chain looks like a deliberate sequence, not duplicated cards.

**4. "Verb + object" running label.**
- `runningLabel` should be `${verb} · ${object}` derived from input, e.g. **"Running command · npm test"**, **"Searching the web · best 2024 indie playlists"**, **"Opening page · pitchfork.com/…"**. Falls back to the verb alone only when no input is available yet (early streaming).

### Proposed registry shape (extends `getToolInfo`)

Replace the if/else in `lib/tools/getToolInfo.ts` with a keyed registry + matchers. Sketch:

```ts
type ToolInput = Record<string, unknown>;

interface ToolDescriptor {
  category: string;          // eyebrow, e.g. "Shell command"
  icon: LucideIcon;          // domain icon (Terminal, Globe, Database…)
  tone: ToolTone;            // category color (info/accent/warning…)
  verbRunning: string;       // "Running command"
  verbDone: string;          // "Ran command"
  describe: string;          // plain-English one-liner
  // pull the salient arg for "verb · object"
  object?: (input?: ToolInput) => string | undefined;
  // short past-tense summary from the result
  summarize?: (output?: unknown) => string | undefined;
}

// 1) exact-name map  2) prefix/category matchers  3) generic fallback
const REGISTRY: Record<string, ToolDescriptor> = { /* spotify_*, search_web, ... */ };

const MATCHERS: Array<[(name: string) => boolean, ToolDescriptor]> = [
  [n => /bash|shell|exec|command|terminal/i.test(n), { category: "Shell command", icon: Terminal, tone: "warning",
    verbRunning: "Running command", verbDone: "Ran command",
    describe: "Runs a command on the server to set things up or check results.",
    object: i => firstString(i, ["command", "cmd", "script"]) }],
  [n => /search|query|find/i.test(n), { category: "Web", icon: Globe, tone: "info",
    verbRunning: "Searching", verbDone: "Searched", describe: "Looks something up for you.",
    object: i => firstString(i, ["query", "q", "search"]) }],
  // url/file/db/email matchers …
];

const GENERIC: ToolDescriptor = {
  category: "Action", icon: Wrench, tone: "neutral",
  verbRunning: "Working", verbDone: "Done",
  describe: "The assistant used a tool to complete this step.",
  object: i => firstString(i, ["command","query","url","path","name","id"]),
};
```

Then `getToolInfo(name, input?, output?)` returns the resolved descriptor + computed `runningLabel = object ? `${verbRunning} · ${object(input)}` : verbRunning`. Keep the existing exact-name entries (spotify, search_web, composio) so nothing regresses; the matchers + generic fallback only improve the unknown path.

**Why a registry (love rationale):** the difference between a generic chat wrapper and a crafted product is that *every* tool — even one nobody hand-designed — still reads as an intentional, explained step. A good fallback is where taste compounds.

### Implementation pointers (for the engineer)

- `getToolCallComponent.tsx`: pass `part.input` into `getToolInfo` and let the pill render `verb · object`. Pull a domain icon from the descriptor instead of always `Loader2`.
- `getToolResultComponent.tsx`: in the default branch, replace bare `GenericSuccess` with a richer generic card that takes `{ descriptor, input, output }` (eyebrow + verb·object title + describe subtitle + collapsible output + duration). Keep `GenericSuccess` for the truly-empty case.
- `GenericSuccess.tsx`: extend to accept `eyebrow`, `description`, `inputSummary`, and a collapsible `output` slot — or introduce a sibling `GenericToolResult` and reserve `GenericSuccess` for quiet confirmations.
- `MessageParts.tsx`: compute step index per assistant turn (count tool parts) and pass to the card; optionally wrap consecutive tool parts in a rail container.
- `humanizeToolName.ts`: keep as the last-resort label, but note it mangles real product names ("Get Spotify Album" is fine; an MCP tool like `whoami` → "Whoami"). Add a small alias map for known oddities, used by the registry's generic branch.

---

## Prioritized backlog (consolidated)

| Pri | Area | Finding | Change |
| --- | --- | --- | --- |
| P0 | Clarity | Default/MCP path shows noun + "Data processed", no input → looks broken/looping | Registry + verb·object + plain-English describe + input echo |
| P0 | Clarity | Repeated calls visually identical | Surface `part.input`; collapsible `part.output`; step index |
| P0 | Motion | loading→success is mount/unmount swap | Shared layout/AnimatePresence crossfade; stable shape |
| P1 | Motion | No completion micro-interaction | Check draw-in / tone sweep on resolve |
| P1 | Structure | Chains don't read as a sequence | Step numbering + optional timeline rail |
| P1 | Code | `getToolInfo` brittle if/else, weak fallback | Keyed registry + matchers + rich generic |
| P1 | Shell | Pill→card shape change on resolve | Loading-tone card or pill-as-header continuity |
| P1 | Skeleton | Skeleton anatomy ≠ final card | Align alignment/tone/typography 1:1 |
| P1 | Error | Retry missing on historical errors | Always provide an action; collapse raw error |
| P2 | Color | Tones under-used as information | Category→tone map |
| P2 | Motion | Generic spinner/shimmer | Restrained music-native signature (eq bars/waveform) |
| P2 | Header | No eyebrow/category, no duration | Add `eyebrow` + `ToolMeta` slots |
| P2 | Consistency | `ToolEmpty` icon shape differs | Align to chip language |
