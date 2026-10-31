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
pnpm exec vitest run components/IntelligentUI/__tests__/CreativeComparison.test.tsx lib/intelligent-ui/playground/creative components/IntelligentUI/__tests__/Playground.test.tsx
```

This image comparison is one bounded authored slice of #2213. Audio/video comparison,
signed URL expiry, real generation/access services, accepted variants in an owning
backend and actual follow-up submission remain outside it. Native image inspection,
keyboard/responsive and slow-network acceptance remain pending a browser lease;
source tests do not prove these. No claim is made for native playback, physical
devices, speech accessibility or human creative approval. The existing original
song/audio example remains unchanged.
