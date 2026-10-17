# Intelligent UI: composed answers

A development/preview implementation of the first three contrasting proofs in
[epic #2197](https://github.com/recoupable/app/issues/2197) and
[RFC #2240](https://github.com/recoupable/app/issues/2240).
[RESEARCH.md](./RESEARCH.md) records the research, its limits, and the unrun
comparative evaluation. User benefit has not been established by a study.

Run `pnpm install --frozen-lockfile`, then `pnpm dev`, and open
`/labs/intelligent-ui`. No AI, authentication, or database credentials are needed.
A Vercel preview must set `RECOUP_INTELLIGENT_UI_PLAYGROUND=true`. Production
returns 404 for the page, fixture stream, and audio route even with that flag.

## Three useful forms

- **Supplier comparison:** prose and a normal Markdown table. There is no custom
  collection card, selection control, draft action, or fake purchasing workflow.
- **Listening patterns:** a derived concentration statement, a static ranked
  distribution, interpretation, and source disclosure. All eight synthetic counts
  share the same reporting window. Counts remain plays, not unique listeners;
  the complete supplied selection does not imply a whole artist catalog.
- **Explore a song:** explanation, a native audio player, section intervals, a
  linked description, and continuation in prose. The original 48-second
  instrumental is synthesized locally; its section notes document the authored
  arrangement. No model analyzed customer audio. Selection can seek without
  starting playback. Native playback updates the indicated section without
  moving focus or announcing each playhead change.

The response is one reading sequence. Static visuals need no controls, and a
rich document does not require rendering every available component. The old
record-difference gate and unused collection/draft widgets have been removed.
The two earlier release/sourcing documents remain protocol regression fixtures,
not additional examples in the menu.

## Reusable boundaries

| Layer                  | Files                                                                                                                                               | Responsibility                                                                                 |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Portable contracts     | `schema.ts`, `contractValues.ts`, `representations/schemas.ts`, `presentation/answerSchema.ts`                                                      | Bounded versioned data, semantic measurements, interval/media identities, ordered answer parts |
| Validation             | `validateUniqueIds.ts`, `representations/validateRepresentation.ts`, `presentation/validateAnswer.ts`                                               | References, coverage, dates, units, time bounds, same-revision answer/data                     |
| Protocol               | `applySurfaceEvent.ts`, `parseSurfaceStream.ts`, `streamLimits.ts`                                                                                  | Atomic revisions, cancellation, bounded NDJSON                                                 |
| Presentation           | `presentation/selectPresentation.ts`                                                                                                                | Explicit registered task benefit and host support; text remains successful                     |
| Pure calculations      | `representations/computeDistribution.ts`, `describeConcentration.ts`, `getActiveSection.ts`                                                         | Shared arithmetic and time-to-section derivation; no generated executable expressions          |
| React host adapter     | `components/IntelligentUI/AnswerRenderer.tsx`, `MarkdownPart.tsx`, `DistributionView.tsx`, `TimelineView.tsx`, `SegmentedTimeline.tsx`, `Evidence*` | Interleaved content, native controls, static/text equivalents, source disclosure               |
| Fixture domain recipes | `playground/`                                                                                                                                       | Authored content and sourced synthetic data, original audio, approved asset resolution         |
| Local view state       | `representations/useTimelinePosition.ts`, `getTimelineStateKey.ts`                                                                                  | Bounded position cache; never playback state or business records                               |
| Transport              | `app/api/intelligent-ui/playground/`                                                                                                                | Environment-gated stream and seekable fixture audio                                            |

The portable schemas, validators and calculations have no React, DOM, Next.js,
service or music dependency. Hooks and host adapters sit outside that boundary.
Distribution data can describe another domain's quantities; interval data can
stand alone without audio. A host resolves an asset ID to a trusted URL; the
model/document never supplies an audio URL or arbitrary callback.

Presentation benefits are curated recipe metadata (`show-distribution` and
`navigate-time`) checked against a representation and host support. This is not
an AI trained to judge usefulness. It does not infer user benefit from row count,
numeric variation, control count or a confidence score. A future model producer
and its selection evaluations remain separate work.

## Coherent responses and replay

An optional `answer` travels inside the validated surface. Its ordered parts are
Markdown, a registered derived insight, a representation reference, or sources.
The answer revision must match the data revision. A patch to an answered document
must supply an answer for the new revision; incomplete references or incompatible
calculations invalidate the entire update. Existing unanswered protocol fixtures
remain supported. This is prototype evolution of the v1 catalog, not a published
SDK compatibility promise.

The concentration insight, ranked bars and text alternative use the same
calculation. `getAnswerText` derives the current fallback/export from ordered
parts rather than the legacy `fallbackText` copy. Changing counts recomputes the numeric insight. Arbitrary authored
prose still requires source/semantic evaluation; a matching revision is not a
proof that every natural-language claim is correct.

1. A validated `surface.snapshot` initializes the stream. The host checks surface,
   workspace, subject kind and subject ID.
2. `surface.patch` advances exactly one revision. Components, answer, evidence
   and fallback are validated as one transaction.
3. Completion must match the document revision and be followed by clean EOF.
   Replayed snapshots, stale bases, malformed data and trailing events fail.

The lab initially shows a completed fixture. `useExampleReplay` keeps diagnostic
stream state separate from the committed response. Replay, cancellation and
failure preserve the last complete answer. A successful coherent replacement can
update both prose and representations. No ordinary data arrival forces a modal
or changes the user's focus. This is buffered replay, not live progressive chat.

## Playback, local state and fallback

Timeline selection, active-section indication and explanation derive from one
position. The native media element supplies time updates; choosing a section
seeks if metadata is ready, or queues the seek until it is. No programmatic play
call is made. Removing a player pauses it. A duration mismatch, missing asset or
playback error leaves section notes available rather than simulating audio.

Only finite positions within the declared duration are cached. The key includes
workspace/subject scope and a fingerprint of the interval/asset description.
Changed meanings reset the cache; returning to the same example restores the
position without playback. Disabled or full storage leaves the view usable in
memory. Legacy fixture draft keys are not overwritten.

The original PCM WAV is generated once per server process. The gated route
supports bounded byte ranges for seeking and sends no-store headers. The page,
stream and audio route have NetworkOnly PWA exclusions; the page is noindex and
mounts only the theme provider. Account/wallet behavior on other routes is
unchanged.

Markdown skips HTML, images and unsafe links. Source links allow credential-free
HTTPS. All chart values are labeled in the DOM; unsupported rich representations
fall back to their supplied values, basis or ordered section notes. Timeline
buttons reflow in narrow containers, and native playback retains familiar
keyboard controls. Source dialogs restore the triggering control's focus.

Bounds include 256 KiB per line, 2 MiB per stream and 256 events, plus limits on
answer parts, records and annotations. These limits do not provide tenant
permissions. Fixture completion, source coverage and business approval remain
separate facts.

## Verification and remaining scope

```sh
pnpm exec vitest run lib/intelligent-ui components/IntelligentUI app/labs/intelligent-ui providers/__tests__/PlaygroundProviders.test.tsx components/Context/__tests__/ContextPageLayout.test.tsx
```

Also run Next type generation, TypeScript, scoped ESLint, formatting checks and a
production build. Tests cover coherent changed/rejected replay, exact arithmetic,
source safety, interval bounds, native-media events, position restoration,
non-autoplay, missing-media fallback, WAV/range correctness, and environment/
provider/cache isolation.

Manual browser review of visual quality, actual device audio playback, native
media accessibility, light/dark contrast and 200% zoom remains separate from DOM
and byte-level checks. Prior browser access was blocked by the browser URL policy;
no fresh visual review is claimed or bypassed through another browser surface.
Optional participant research is unrun and does not block shipping; deterministic
correctness regressions remain mandatory.

This advances contracts, presentation, reusable patterns and media exploration.
Live chat integration, model-generated answers, authorized customer-data adapters,
server actions/receipts, cross-device state, a second host and a published SDK
remain outside this slice. It does not complete the company-wide epic.
