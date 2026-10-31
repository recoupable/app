# Workflow snapshot transport and first chat consumer

The original characterization slice of [#2205](https://github.com/recoupable/app/issues/2205)
against the existing `createWorkflowChatTransport` and installed chat SDK. It uses
the Surface schema merged through [#2243](https://github.com/recoupable/app/pull/2243)
at `9faf39d56840e008e28bd14ff8197dfb6cec77ab`.

The `data-intelligent-ui-snapshot` name remains an experimental synthetic fixture,
not a live producer/API contract. The first ordinary-chat consumer now validates
that fixture at the existing transport boundary and renders it in `MessageParts`,
as a bounded first slice of #2205 and [#2209](https://github.com/recoupable/app/issues/2209).

## What the existing application path does

The tests instantiate the real `Chat` with the application's current transport.
Only external `fetch` responses are synthetic. Eight cases characterize:

- Stable-ID replacement beside ordinary streamed text.
- Three reconnect cuts, using the transport's authenticated GET recovery and
  `startIndex` cursor. That cursor counts stream chunks, not Surface revisions.
- Reload of a serialized SDK message followed by replay and stable-ID replacement.
- Byte-at-a-time SSE decoding, including split UTF-8.
- Preservation of reasoning, files and tool outcomes beside the candidate part.
- Opaque data and callback arrival order: the SDK can store an older or
  Surface-invalid candidate while ordinary text and stream completion remain healthy.

That last behavior is a baseline limitation, not revision-aware recovery. The
existing Surface validator rejects the malformed fixture; the SDK does not apply
that domain validator or preserve a highest accepted revision on its own.

Run `pnpm exec vitest run lib/intelligent-ui/transport` to exercise these cases.
No model, customer account or external service is called by this suite.

## Development-only integration

`NEXT_PUBLIC_RECOUP_INTELLIGENT_UI_CHAT=true` opts a local development build in.
The default is off. `NODE_ENV=production` is always off, including preview and
production builds with the flag set. Production deployment markers also block
the consumer. No endpoint, producer, account operation or provider action is added.

`useVercelChat` supplies the authenticated actor, effective account (including an
account override), workspace, session/chat and explicit subject. Ordinary artist
chat keeps its selected organization and artist mapping. Behind the same local
development-only gate, the canonical session/chat route accepts `?catalogId=UUID`
and carries that input through `Chat`, `VercelChatProvider` and `useVercelChat`.
Zod validates a branded catalog UUID; malformed or repeated/array parameters are
explicit invalid inputs and cannot fall back to an artist. A catalog needs no
selected artist, and changing the selected artist does not repoint it.

The catalog workspace comes from initialized `OrganizationProvider` selection.
An organization uses its selected UUID; initialized Personal uses the effective
account UUID with workspace kind `account`. An uninitialized null selection is
not Personal. Both workspace ID and kind participate in catalog lifecycle scope.
Studio/label names in lab fixtures do not prove live identifier mapping. Host
scope is a lifecycle/cache binding, **not an authorization rule**; the reusable
consumer still compares any explicit host subject kind.

The explicit development route also accepts raw `since`, `days`, `page` and
`limit` query parameters, carried as `catalogQuery` through the same owning path.
`since` must be a real UTC `YYYY-MM-DD` date and `days` an explicit integer from
1 through 366. No date or reporting window is invented. Only absent `page` and
`limit` use the API's existing defaults, 1 and 25. Page is bounded to 1–1,000,000
and limit to 1–25. Malformed, repeated, empty-array, empty-string or out-of-bounds
fields cannot bind a catalog surface. A valid catalog with an incomplete query
remains ordinary text with no artist fallback. Query-only route input without
`catalogId` keeps the ordinary artist path.

For a complete catalog host only, the existing `POST /api/chat` boundary captures
the committed request alongside request IDs, before asynchronous authentication.
It matches the API-owned strict `devCatalogSurface` request:

```json
{
  "devCatalogSurface": {
    "workspaceId": "selected-workspace-uuid",
    "query": {
      "catalog_id": "explicit-catalog-uuid",
      "since": "2026-09-01",
      "days": 28,
      "page": 1,
      "limit": 25
    }
  }
}
```

The request selects one bounded page, not the entire catalog. Reporting bounds,
page and coverage must remain disclosed by the qualified producer's answer and
sources. Workspace kind remains in local scope; the payload contains neither an
actor nor a credential. Browser references never grant authorization. Existing
bearer token, account override and ordinary routing fields keep their existing
paths; explicit catalog hosts omit `artistId`. No new producer field is sent for
default/artist, incomplete, gate-off or production hosts. The transport strips
per-message `devCatalogSurface` and the obsolete `intelligentUI` field on every
path, including disabled and production paths; only the gated committed host can
supply the producer request. Other ordinary body fields keep their routing.

Normalized catalog/query/window/page/limit participate in committed cache and
pending-operation identity. Equivalent numeric input retains that identity;
changing the query invalidates previous accepted surfaces, late callbacks and
pending history. A valid catalog with an incomplete query has partial local
scope with no UI binding, so completing/changing its query cannot upgrade a
pending ordinary-text operation into a catalog request. Scope cancellation while
provisioning or authentication prevents a stale request from reaching fetch.
The owning hook captures the committed send intent before its first preparation
await, including composer, append, Retry/Edit and initial-message sends. The
consumer's preparation epoch changes on committed host/query/session changes,
Stop and disposal, so leaving and returning to the same key cannot revive an
obsolete send. Its own SDK stream start does not expire still-current completion
cleanup. Equivalent normalized inputs, stable first-send provisioning and
suspended/discarded renders preserve the current intent. After each auth/model
or trailing-deletion wait, obsolete operations cannot dispatch SDK work, replace
current history/input or clear the current draft's attachments. The existing
submission lock can admit a current operation while an obsolete wait settles;
that old operation cannot release the newer lock. Existing client model/deletion
hooks guard their own auth and success callbacks with the same intent. Already
issued HTTP mutations are not undone; cancellation suppresses subsequent stale
client work. Disabled/production preparation keeps its existing behavior.
Suspended or discarded query renders leave the committed answer and stream
intact. Canonical development URL updates retain explicit raw query values,
including invalid/repeated/empty-array intent; default and production URLs stay
unchanged. This route is an explicit local fixture input, not a product query
picker or saved selection UI.

App does not synthesize source fingerprints, retained observations, query/window
policy or catalog access rules. Qualified source-to-screen acceptance still
requires the MCP-owned producer and independent Records validation. Schema-v1
Surface context contains workspace ID and typed subject, without proof of
workspace namespace or reporting query. The local query key guards committed
callbacks; it does not establish server history/query authority, authenticate a
persisted answer's reporting inputs, or repair a producer mismatch. Historical
answers stay historical; App does not refetch or relabel their evidence current,
persist selected/business state or activate production. Complete snapshots must
continue to carry matching answer/data revision, deterministic text and evidence.
While provisioning, the host can supply stable actor/workspace/subject/query
fields with an empty session so a change still cancels the pending UI intent.
No UI binding is available until all required fields are complete.

React rendering only projects the prospective binding key and reads accepted
content. A prospective scope cannot display the committed scope's UI, but it
does not abort its stream, advance its epoch or clear its ledger. The transport's
IDs, scope, message getter and token getter, plus the history callback guard,
update in layout effects when the host actually commits. A scope switch then
invalidates old callbacks before paint; a suspended or discarded transition
leaves the still-visible answer, stream and pending history intact. Snapshot and
fallback lookups do not mutate the consumer.

The consumer runs after the workflow transport counts raw chunks and before the
SDK can replace stable-ID data. It accepts one coherent Surface per assistant
message, with matching data-part ID, workspace/subject and answer/data revision.
Only complete snapshots may skip revisions. Stale, equal, malformed, mismatched
or patch-shaped candidates cannot overwrite the highest accepted snapshot.
Persisted history is parsed into fresh objects before replay, under the scope
captured by its loader. Late history callbacks cannot bind a previous scope.

Each stream validates at most 256 snapshot candidates and 2 MiB of candidates;
each candidate is limited to 256 KiB of UTF-8 JSON. This bounds this consumer's
work and retention, not the upstream SDK's SSE/JSON parser. Its full snapshot
ledger retains at most 16 messages and 2 MiB. Older validated messages retain
scope-bound deterministic text through weak object bindings, so a snapshot-only
history answer stays readable after visual eviction. A replay can recover its
revision floor from those bound SDK messages. Scope changes invalidate both the
visual ledger and historical bindings.

Stop, aborted signals, scope changes and unmount invalidate active stream tokens.
Stop keeps the last accepted answer; a new stream generation may update it under
the current host scope. Interrupted connections keep the same filter and the
workflow's existing authenticated reconnect cursor. Ordinary text, reasoning,
files, tools, unrelated data and completion events retain their existing routes.
First-send scope binds when provisioning settles and request IDs are selected,
before asynchronous authentication or response work. Cancellation while waiting
cannot be revived by that late binding.

The gated ordinary-chat hook waits for a successful current-scope history load
before enabling initial auto-resume. It installs canonical messages and publishes
the transport's live getter synchronously, including successful empty history.
This prevents available text-first response bytes from creating a temporary SDK
assistant while its saved owner is still unresolved. Missing tokens, HTTP errors,
failed loads and late results from a previous scope cannot enable resume. Stop
still allows saved history to display, without resuming. An intentional Send,
Retry or append supersedes that pending history so it cannot erase the new turn;
unmount prevents the pending installation altogether.

The transport factory itself requires callers to install canonical history
before letting a no-start stream reach the SDK. It cannot safely retarget an SDK
assistant already created by ordinary text. Its gated reconnect buffers at most
one filtered chunk, allowing history installed before those bytes to seed the
SDK's assistant state and existing prose; this is not a substitute for the owning
hook's readiness guard. No-start targets come only from current scope-bound
history/stream state. Stop, unmount and scope changes abort a pending read; other
errors propagate to ordinary chat handling. The disabled/default path retains
its existing eager auto-resume and history-loading behavior.

`MessageParts` lazy-loads the existing answer/timeline/distribution/source views
only when the gate and accepted binding allow them. Deterministic accepted text
is the loading, module-error and renderer-error fallback. There is no surrounding
page chrome. Compatible timelines retain their existing stable control keys and
focus across unrelated prose/evidence changes; changed interval meaning resets
them. Chat uses a host- and message-bound local-state key, so a second answer
reusing the same Surface/component IDs starts independently; the lab's state-key semantics remain
unchanged. The chat's local position cache uses the stable actor/account/workspace,
session/chat, subject and query identity, plus message, surface and timeline
meaning. Live rendering and callbacks continue to use the separate generation
binding. Returning to a scope or reloading can restore its selection only after
current-scope history or stream data has been accepted again; the position cache
cannot restore content or authorize access. This is browser-local view state,
not cross-device persistence or an accepted Context record. Older experimental
keys containing generation suffixes are left untouched and are not migrated,
since their scope cannot be safely inferred. Local section/source controls make no network request. This slice
does not resolve audio assets, so notes remain usable without initiating media
or provider requests.
Completed ordinary prose retains its existing Retry action when the new UI is
the trailing content, including loading or renderer fallback. Tools and files
keep their existing action routing.

For a gated assistant answer with an accepted snapshot or validated historical
text fallback, `MessageParts` provides one existing Copy response action. It
copies ordinary prose and deterministic accepted answer text in their displayed
order, including complete representation values and composed source citations.
Snapshot-only answers also have that action and the existing Retry action when
chat is ready or has failed, including deterministic loading/error/history fallback.
Retry is absent while a new request is submitted or streaming. It uses the existing
chat reload handler and does not recover unaccepted or scope-invalid content.
Copy resolves the same accepted
revision as rendering; rejected raw parts cannot replace its payload. Loading or
renderer failure does not remove it, and a scope change removes the old UI text
from both display and copy. The payload describes the complete answer, including
all timeline sections, rather than the locally selected section or seek
position. Ordinary, disabled and production paths keep their per-text-part copy
behavior. Clipboard handling and feedback remain owned by `CopyButton`/`useCopy`.

The synthetic suites cover real `Chat` + workflow transport, the transport hook's
scope/StrictMode lifecycle, and `MessageParts` + existing visual renderers. The
history-readiness suite also runs the actual owning hook, message loader and HTTP
history utility with real SDK/transport/rendering and synthetic external
providers/fetch. It exercises text-first bytes, a nonempty stale getter, canonical
saved prose plus newer UI, empty success, failure, cancellation, superseded loads
and gate-off behavior. Concurrent Suspense cases keep the committed artist and
workspace response streaming while another scope renders without committing,
and allow its pending canonical history to finish. Other ordinary-chat adapters in rendered tests are
synthetic; existing tool-routing regression suites separately exercise their
normal implementations. Native
acceptance uses a local-only synthetic harness, not a production feature route.

## Remaining integration

The earlier standalone acceptance/retention prototype and its policy-only tests
were removed after review because no owning application flow consumed them.
[The review finding](https://github.com/recoupable/app/pull/2246#discussion_r4321888981)
is addressed by deferring that engine until it ships with a real consumer.

#2205 still owns broader stream/producer compatibility and resource-budget
acceptance. #2209 still owns live evidence/subject-context qualification and full
host integration. This first consumer does not complete either issue.

The app versions exercised are `ai@6.0.241`, `@ai-sdk/react@3.0.243` and
`@workflow/ai@4.2.0`. The captured serializer compatibility below qualifies one
bounded wire fixture. Database persistence/concurrency, actual API workflow
execution, renderer behavior, browser/media behavior and latency/resource budgets
remain unverified by this suite. Production feature gates and the parent native
criteria are unchanged.

## Captured API SDK wire compatibility

`__fixtures__/api-6.0.190/stream.sse` contains the actual bytes emitted by
`ai@6.0.190`'s `createUIMessageStreamResponse` from the adjacent synthetic
`input.json`. That is the SDK version declared by API commit
`2dbf74288d9bc5a205632c1fc52fc4a18855c3ff`. The SDK was already installed; capture
executes only its pure serializer, after checking the package name, exact version,
package JSON hash and import-entry hash. It does not execute the API application.
The manifest records both source references, declared consumer versions, input and
SSE byte counts/hashes, actual response headers, and SSE record offsets. It has no
local machine paths or nondeterministic capture timestamp.

The App test reads those committed bytes directly. It does **not** re-encode the
fixture with App's serializer and needs no sibling API checkout, second SDK
installation, download or live producer. It checks the installed consumer versions
before characterizing the real `Chat`, `createWorkflowChatTransport` and snapshot
consumer. Only `fetch` responses and host identity/authentication are synthetic.

The fixture has **24 raw chunks, 25 complete SSE records and 12,175 bytes**. The
last SSE record is `[DONE]`, not a cursor chunk. The test covers **26 HTTP body cut
positions**: the empty prefix and the boundary after each of the 25 records. Cuts
before the `finish` chunk reconnect with `startIndex` equal to the count of raw
chunks already received, including rejected snapshots. The two boundaries after
`finish` complete without reconnecting, including EOF before `[DONE]`. This is
every event boundary in this fixture, not every possible stream or arbitrary
mid-record HTTP failure. A separate case delivers all 12,175 bytes one at a time,
including split multibyte UTF-8.

Every cut preserves Unicode prose, reasoning, an inert file reference/tool
outcome, unrelated data and normal completion beside one stable assistant/UI
part. Snapshot revision 2 is followed by an exact duplicate, a conflicting equal
revision, an older revision, mismatched answer/data revisions, an unknown Surface
version and an unsupported patch-shaped candidate; only the final valid revision
12 advances it. Assertions pin literal final values, computed answer text and
source citation, with accepted callbacks exactly `[2, 12]`. A staged three-body
case also checks retained revision-2 values before recovery at raw cursor 19.
Trusted serialized revision-2 history is hydrated before a start-bearing replay;
only revision 12 produces a new accepted callback. That case does not qualify
database history, unbound no-start streams or arbitrary prose replay semantics.

To regenerate offline with the already installed, pinned SDK package:

```sh
node scripts/intelligent-ui/captureWorkflowWireFixture.mjs \
  --sdk-root /path/to/installed/ai-package \
  --output /path/to/temporary/capture
```

Omit `--output` to replace the owning fixture. Format `input.json` **before**
capture; even whitespace changes require a new input hash. Compare all three
generated files byte-for-byte before accepting a regeneration. Run
`pnpm exec vitest run lib/intelligent-ui/transport` using only App dependencies.

This is serializer/decoder/consumer compatibility evidence for one pinned offline
fixture. It does not establish a live producer contract, actual API routing,
workflow persistence/replay, authenticated account authorization, database
concurrency, media/provider execution or full #2205/#2209 acceptance.
