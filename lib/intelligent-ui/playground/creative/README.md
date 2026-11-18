# Local creative comparison — #2213

The development-only **Creative comparison** lab compares the existing owned Recoup
light/dark wordmark treatments at SHA-256 byte revisions. These are alternate
variants, not a fabricated sequence of edits, generated customer assets or completed
production jobs. The exact hashes are checked against the original repository files.
No new media is generated or downloaded. Captions and provenance name each file.

The entry requires the existing local chat opt-in gate; production cannot mount it.
No core surface/event schema, ObjectRef, Context authority, legacy chat behavior,
backend, permissions or API contract changes. `ImageResult` keeps its existing
fallback alt text and behavior; optional alt/load/error callbacks let this host
identify inspected images and invalidate failed previews. Images are mounted only
after the user chooses Inspect, so unopened media has no request.

`types.ts` defines a fixture-only asset/version reference and bounded local draft.
`useCreativeDraft` stores selection and at most eight 2,000-character revision-bound
notes in this browser, scoped to the authored comparison. Storage failure is visible
and leaves current in-memory work usable. Malformed/oversized/ambiguous saved data
is rejected. Scope changes isolate state; changed or unknown asset hashes never
inherit notes or selection. A stale choice stays explicit rather than selecting a
replacement. Notes are not business approval, generation completion or publication.

The resolver allowlists exact asset hashes and preview identities. Synthetic controls
make the second variant processing, unavailable or withdrawn without changing the
source asset or starting a job. These states do not mount media or expose a selected
follow-up. Actual image errors also invalidate the reference. A returned available
state requires fresh preview inspection. Reload restores the exact choice and notes,
with the reference withheld until the corresponding preview has loaded again.

The read-only local follow-up text contains scope and the selected fixture asset/hash
only: no notes, URLs, auth, Context grants or live continuation. Selectable text uses
ordinary browser copy; the host does not invoke clipboard, chat, provider or network
actions. Public sharing and approval controls are deliberately absent.

Run:

```sh
pnpm exec vitest run components/IntelligentUI/__tests__/AudioComparison.test.tsx components/IntelligentUI/__tests__/CreativeComparison.test.tsx lib/intelligent-ui/playground/creative components/IntelligentUI/__tests__/Playground.test.tsx
```

The image and audio comparisons are bounded authored slices of #2213. Video comparison,
signed URL expiry, real generation/access services, accepted variants in an owning
backend and actual follow-up submission remain outside it. Native image inspection,
keyboard/responsive and slow-network acceptance remain pending a browser lease;
source tests do not prove these. No claim is made for native playback, physical
devices, speech accessibility or human creative approval. The existing original
song/audio example remains unchanged.

## Audio successor (depends on App #2388)

The separate **Audio comparison** entry uses the same development opt-in gate and
version-1 draft schema. It has its own `original-section-study-comparison` scope;
existing `owned-wordmark-comparison` storage and image fixtures are unchanged.
No Context, ObjectRef, provider, upload, account or production activation is added.

The original deterministic `createSectionStudyAudio.ts` synthesis is unchanged.
`createAudioExcerpt` slices its 22,050 Hz, mono, 16-bit PCM samples without resampling,
normalizing or regenerating a section, and rewrites only the two WAV length fields.
The intro is [0, 8) seconds (352,844 bytes); the chorus is [28, 40) (529,244 bytes).
These are different sections of one authored synthetic study, not successive edits,
generated customer variants or production-quality evidence. There is no speech or
lyrics. The full study SHA-256 is
`c4349e4a106390dbb804eb48989c8d69a0596d0af369e83a2cc6f2f278e7c8af`.
Exact excerpt hashes live in `audioExcerpts.ts`; tests compare all PCM samples to
the source slice and verify the complete WAV hashes and durations.

The new `/api/intelligent-ui/playground/audio-excerpts/[revision]` route requires
the same opt-in, refuses unknown revisions, and verifies synthesized bytes against
the requested SHA-256 before serving them (503 on mismatch). It serves small complete
WAV responses, including when Range is requested; it does not claim partial-content
support. Responses are no-store. The original audio route remains unchanged.

No audio element or media request exists until explicit Inspect. The native labeled
controls have no autoplay; the user presses Play. `canplay` permits a separate
Choose action, but neither loading nor playing chooses or approves anything. A
stored explicit choice still requires fresh inspection/readiness after remount.
Media error and simulated processing/unavailable/withdrawn states remove playable
controls and invalidate the local reference. Notes remain attached to exact hashes.
The local follow-up contains only the fixture reference and scope, never note text,
audio URLs or authority. Shared `AudioResult` and its live callers remain unchanged.

Pending native acceptance: audible intro/chorus inspection, keyboard and screen-reader
control names/actions, no autoplay, narrow layouts, loading/failure/recovery, seeking
with complete WAV responses, browser reload/storage and production gate behavior.
DOM events and direct route tests do not prove browser playback or human approval.
