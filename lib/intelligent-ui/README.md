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

An all-zero distribution uses the existing text alternative because there is no
relative spread to show. This retains the measured zeros, reporting window,
population, supplied/expected record coverage and source disclosure. It neither
infers missing values nor treats an incomplete supplied subset as the whole
collection. Any positive total remains eligible for the declared chart benefit;
there is no minimum-value heuristic.

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
Keyboard focus also reveals the focused content inside a long source dialog;
scroll padding keeps its focus ring visible when Tab wraps between controls.

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

The [October 20 conformance review](REVIEW-2026-10-20.md) records native keyboard,
responsive value/label checks and the subsequent successful media-duration boundary
check. The earlier unavailable-browser condition is historical, not a current
failure of that check. The [review-fix handoff](REVIEW-FINAL-2026-10-19.md) and
[earlier native validation](REVIEW-2026-10-19.md) retain their original source and
test scope.
Forced canplay-before-seekable/progress ordering is deterministic-test coverage.
The [earlier review](REVIEW-2026-10-18.md)
preserves the baseline dispositions and desktop/390px/320px evidence. Physical
mobile playback, audible quality, native screen-reader use and 200% zoom remain
unverified; browser captures do not substitute for those checks or a user study.
Optional participant research is unrun and does not block shipping; deterministic
correctness regressions remain mandatory.

This advances contracts, presentation, reusable patterns and media exploration.
Live chat integration, model-generated answers, authorized customer-data adapters,
server actions/receipts, cross-device state, a second host and a published SDK
remain outside this slice. It does not complete the company-wide epic.

## Development catalog explorer (#2211 source slice)

The lab's **Catalog explorer** adds local search, source-cohort filtering, name
sorting, 25-record pagination and an exact-ID selection capped at eight records.
The selection survives local filtering/paging and resets on leaving the example;
it is not durable Context state or a saved follow-up. The existing production gate
and provider isolation are unchanged. Existing catalog-song paging and saved
Luminate comparison renderers remain separate and unchanged.

`playground/catalog/` generates exactly 10,000 invented recording descriptors.
Recording identity is distinct from release/composition/rights identity. The
recipe maps page rows into the existing portable `collection` contract and
compatible count selections into `distribution`, reusing `computeDistribution`,
`DistributionView` and the representation text fallback. It does not widen the
200-record portable limit or invent a shared Context/API descriptor contract.
The consumed [workspace-bound descriptor adapter](descriptors/README.md) projects
fixture rows into schema-v1 collections and captures exact identity/source-version
selections. Its local checks preserve role, period, unit/currency, territory,
cohort and missingness; unavailable selections remain explicit in UI and text.
Context remains owner of snapshots, persistence and authority.

Observed-shaped fixture values and authored hypothetical values stay separate.
Zero is retained; unknown, withheld and not applicable remain distinct. A missing
period/unit/currency or incompatible basis refuses comparison. Cumulative Spotify
observations are never relabeled as daily or period streams. Browser activity,
Luminate counts, hypothetical value and cash are distinct cohorts. Compatible
currency values are shown without finance aggregation. The separate annual scenario
consumes the pinned Catalog-owned runtime described below; no formula is authored
in App and none of these existing rows is relabeled as an annual measurement.

Coverage describes the filtered supplied fixture; chart totals describe only the
selected records. Neither becomes a catalog population claim. The fixed source
age (11 days at the authored October26 reference), absence of historical membership,
missing values and small-selection limits are visible. The copyable text view
contains only the bounded current page plus exact selection, preserving values,
basis, provenance, coverage and refusal reasons. It does not export unseen rows.
Native selects, checkboxes, buttons and disclosure controls remain keyboard usable;
the chart supplements textual values rather than replacing them.

Focused verification:

```sh
pnpm exec vitest run lib/intelligent-ui/playground/catalog components/IntelligentUI/__tests__/CatalogExplorer.test.tsx components/IntelligentUI/__tests__/Playground.test.tsx app/labs/intelligent-ui/__tests__/page.test.tsx
CATALOG_EXPLORER_MEASUREMENT=/tmp/catalog-explorer-measurement.json pnpm exec vitest run components/IntelligentUI/__tests__/CatalogExplorer.performance.test.tsx
```

The opt-in measurement records 100 warmed local query samples and 30 React/jsdom
cohort changes with 10,000 inputs, while asserting at most 25 data rows plus the
header. It reports environment, median/p95/max and mount time. These are descriptive
local measurements, not browser-paint performance, an SLA or real catalog acceptance.
There are no additional reads, provider/model calls, ingestion, durable saves or
production activation. Authenticated evidence under #2177, durable selections and
remaining #2211 dependencies/acceptance remain separate work;
this slice does not complete the epic.

### Separate annual Spotify scenario

“Explore separate annual scenario” opens the Catalog-owned synthetic vector: one
1,000-stream measurement and one unknown recording for January 1, 2025 to January
1, 2026. It does not consume or modify the 10,000 explorer records. Annual refs use
`synthetic:annual-scenario-workspace`, fixture authority, exact recording IDs and
source version IDs, resolved with the merged Context adapter. The selection stays
local and is cleared on closing the panel; resetting the rate retains selection.

The sole lever is a nonnegative hypothetical USD/Spotify-stream rate. Reset passes
null to restore the supplied baseline; fixed assumptions remain illustrative.
Results display selected coverage and explicit unknowns. The JSON text receipt
includes unchanged observations/hash, both complete assumption sets, all bands,
limitations, exact selection refs, method, adapter, Python-reference provenance and
consumer source pins. Superseded keyed requests are unmounted; their asynchronous
results/errors are discarded. Loading, refusals and errors are announced, and no
old receipt remains visible during changed-input calculation.

`playground/catalog/scenario/vendor/scenario.mjs` is copied byte-for-byte from
`recoupable/skills` commit `f9b56047655689b12fe7dbfe77b8e8ba6e989d45`, path
`skills/recoup-catalog-estimate-value/scripts/scenario.mjs`, SHA-256
`0cd92009fe39e237cafb44d033c4e1488b9811d783fdf000ec89b279893117ce`.
The [pin manifest](playground/catalog/scenario/source-pin.json) also binds the
canonical method, schema, vectors and browser-consumption guide. Hash conformance
tests prevent drift; Prettier excludes canonical files to preserve their bytes.
Change the owning Catalog runtime first, then explicitly update the pin and tests.
The adjacent declaration supplies TypeScript types only; it contains no execution.

Method `public-estimate-spotify-rate/1`, adapter `catalog-browser-scenario/1`, uses
local Web Crypto in a secure context or localhost. Python is a conformance
reference, not browser execution. No endpoint, storage, model or provider call is
added. These invented observations and hypothetical money are not rights findings,
receivables, reported royalties or realized cash. Physical-device, authenticated
source and durable-follow-up acceptance remain separate.

```sh
pnpm exec vitest run lib/intelligent-ui/playground/catalog/scenario components/IntelligentUI/__tests__/AnnualCatalogScenario.test.tsx
```
