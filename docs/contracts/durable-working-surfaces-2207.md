# Durable working surfaces — #2207

Status: proposed implementation contract, October 27, 2026. This document is a
reviewable source/design slice, not a save feature, rollout approval, or closure
of [#2207](https://github.com/recoupable/app/issues/2207). Context owns persistence
and authority; UI owns presentation and local interaction. Root owns integration
and merge. No runtime, migration, grants, or production settings change here.

## Source baseline and existing path

Inspected App `f6092fd5f65ccc247b6bf3d1ec1af9b5f584712e`, API
`4ed1fdb1c4d1da38c0e179530205102f64d252c3`, Database
`001cd115a605f2f69901802999db8220bab0cc45`. Paths below are relative to their
named owning repository and refer to these commits, not deployed-state claims.

| Existing source                                                                                                                        | What it establishes; what it does not                                                                                                                                                                                                                     |
| -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| API `lib/intelligent-ui/prepareCatalogSurface.ts`, `lib/intelligent-ui/README.md`                                                      | Authenticated development-only catalog read; complete schema-v1 snapshot, fresh server assistant/surface ID, immutable revision 1, journaled source preparation and fingerprint. No mutable saved view.                                                   |
| API `lib/catalog/getCatalogStreams.ts`                                                                                                 | Actor's personal/organization owner IDs and catalog link in the selected workspace are checked. Catalog lineage uses retained provider rows, run IDs and hashes, not Context source-version UUIDs.                                                        |
| API `app/lib/workflows/runAgentWorkflow.ts`, `app/lib/workflows/persistAssistantMessageStep.ts`, `lib/chat/persistAssistantMessage.ts` | Successful catalog delivery proceeds to existing assistant persistence. The full UIMessage, including data parts, is stored; the legacy helper catches errors and returns void. Stream completion does not acknowledge durability.                        |
| API `lib/supabase/chat_messages/upsertChatMessage.ts`                                                                                  | Stable message ID overwrite via `onConflict: id` when update=true. No surface revision compare-and-swap. `persistAssistantDataPart.ts` also replaces a merged full message; it is not a safe concurrent surface-save API.                                 |
| Database `supabase/migrations/20260501000000_open_agents_sessions_and_chats.sql`                                                       | `sessions.account_id` → `chats.session_id` → `chat_messages.chat_id`; full JSON in `parts`. Session/chat deletion cascades. RLS enabled, not evidence of a client write grant.                                                                            |
| API `lib/sessions/chats/validateGetSessionChatRequest.ts`, `getSessionChatHandler.ts`                                                  | GET `/api/sessions/{sessionId}/chats/{chatId}` authenticates, requires exact session owner, verifies chat belongs to session, returns full stored messages in creation order. It does not reauthorize every embedded source/workspace after history load. |
| App `lib/messages/getChatMessages.ts`, `hooks/useMessageLoader.ts`, `hooks/useVercelChat.ts`                                           | Bearer-authenticated history load, current-scope checks, then `snapshotConsumer.hydrate` before SDK state publication. The older API `/api/chats/{id}/messages` reads room memories and is not this path.                                                 |
| App `lib/intelligent-ui/chat/createSnapshotConsumer.ts`, `getSnapshotScopeKey.ts`                                                      | Full-schema parsing, workspace/subject checks, actor/account/session/chat/query-bound lifecycle, stale-revision rejection, bounded in-memory ledger and text fallback. Host cache identity is not server authorization.                                   |
| App `lib/intelligent-ui/schema.ts`, `applySurfaceEvent.ts`, `presentation/getAnswerText.ts`                                            | Existing strict schema-v1, coherent answer/data revisions and ordered text. Patch replay is a presentation protocol, not a database transaction.                                                                                                          |
| App `lib/intelligent-ui/descriptors/{schemas,contextObjectRef,resolveSelection}.ts`                                                    | Exact workspace/authority/kind/identity/source-version references; at most eight selected objects in the consumed explorer. Pure projection/resolution does not authorize a read.                                                                         |
| API `lib/context/processContextOperation.ts`, `BRIEF-ACCESS.md`                                                                        | `save_brief` compiles approved request documents for a purpose, then calls `save_context_brief`; entry/pre-save/post-save membership checks. It accepts no arbitrary surface JSON. Do not overload it.                                                    |
| API `app/lib/workflows/fence/README.md`; Database `proposals/chat-writer-fencing-636/PROTOCOL.md`                                      | Internal generation-bound writer and atomic edit proposal, with no public producer/enrollment. Resource authority and credential lifecycle remain blocked. This contract does not activate or bypass that work.                                           |

Source links: [App baseline](https://github.com/recoupable/app/tree/f6092fd5f65ccc247b6bf3d1ec1af9b5f584712e),
[API baseline](https://github.com/recoupable/api/tree/4ed1fdb1c4d1da38c0e179530205102f64d252c3),
[Database baseline](https://github.com/recoupable/database/tree/001cd115a605f2f69901802999db8220bab0cc45).

## State and identity contract

These are distinct dimensions, not a single success flag:

- **Temporary:** in-memory controls, focus, scroll, playback position and unacknowledged
  edits. Label edits “Not saved.” A browser cache is optional convenience, never
  a durable receipt or a second-device source. Playback state is never restored as play.
- **Recoverable:** a full working revision acknowledged by its owning API and
  independently available through an authorized read. Label “Saved” only after a
  known successful receipt; lost acknowledgement is “Save status unknown,” with
  reconciliation against the same operation identity. A rendered assistant answer
  alone is not such a receipt. Local edits over it remain separately unsaved.
- **Committed business change:** an owning domain operation with its own authorization,
  target revision and receipt. Saving a view neither accepts company knowledge nor
  commits rights, payment, publication, plan approval or any external action.

Reuse the existing session/chat/message storage and history spine. Do not add a
parallel client store, generic Context document store or new entity database.
The proposed working-state envelope is a separately validated companion to a full
surface; do not add fields to strict schema-v1 or treat arbitrary message JSON as
trusted. Its physical JSON placement and atomic command must be reviewed with API
and Database before implementation. Assistant streaming must never replace this
companion through an older full-message write.

Logical binding (proposed; no new public wire format in this PR):

| Field                                                | Rule                                                                                                                                                                                                                                                      |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| owner account, sessionId, chatId, assistantMessageId | Server derives owner from authenticated session; verifies the entire parent chain. Client IDs are lookup references only.                                                                                                                                 |
| workspaceId, subject                                 | Must equal the server-validated saved surface scope. Reauthorize selected workspace and source access on every reopen/export/follow-up/write. Session ownership does not grant organization access.                                                       |
| surfaceId, surfaceRevision                           | Exact accepted full schema-v1 surface; never component array index, title or latest-message guess. The immutable catalog result remains revision 1.                                                                                                       |
| workingRevision, expectedWorkingRevision             | Separate optimistic concurrency token for filters/selections/edits. Increment only by atomic successful save; a filter change does not rewrite source revision or pretend evidence changed. Initial creation has an explicit absent-version precondition. |
| selection                                            | Bounded exact ObjectRef array, unique by full reference, max eight for the existing explorer. Same workspace, authority, kind, id and complete sourceVersionIds; no labels as identity.                                                                   |
| filters and plan edits                               | Only fields declared by a registered recipe with explicit types, ranges and compatibility version. No arbitrary JSON path patch, executable expression, HTML, URL or model-supplied callback. No plan-edit recipe is implemented today.                   |
| lineage                                              | Original subject, parent message/surface/revision, source references/fingerprint, recipe/mapping version; retained separately from changed view controls. A duplicate records its parent but gains a new server identity.                                 |
| operation identity                                   | Stable server-bound idempotency identity for a single exact mutation. Changed payload requires a new operation; exact retry cannot become a new action.                                                                                                   |

Use the existing ObjectRef schema as-is. It supports confirmed Context recording,
composition, release and company UUID identities, and explicit synthetic fixtures.
It does **not** identify a catalog, a surface, an artifact, or raw Luminate ISRC/run
lineage. Keep the existing surface tuple and catalog subject separate; never mint
Context UUIDs or mark live data `authority: fixture`. Exact artifact identity must
come from its owning contract; until available, no artifact reference is accepted.
A live selected-track adapter must resolve already-authorized Context identities
with their actual source-version set or explicitly refuse that selection. This
is an implementation prerequisite, not license to broaden ObjectRef here.

## Authorization and save transaction

The same domain operation must back native, MCP and text hosts; transport-specific
widgets carry no extra permissions. Authenticate with existing API/MCP mechanisms.
Do not accept an actor/owner override as surface data. Read the session owner and
chat membership, then authorize the saved workspace, subject and each source/ref.
Reject missing, withdrawn, revoked, forged or cross-scope refs without leaking
private record names. Recheck after asynchronous work before returning content.
Point-in-time rechecks cannot undo an already committed write; the database command
must enforce the chosen current-authority policy atomically with compare-and-swap.
No such working-surface command or deployable authority contract is claimed today.

A future command must atomically validate expected working revision, exact base
surface identity/revision and operation payload; write the bounded complete working
snapshot; and return identity, new revision and normalized outcome. Preserve all
unrelated UIMessage parts. An identical retry returns the original outcome, a
changed payload with the same operation identity is rejected, a stale expected
revision conflicts. Do not implement read-modify-unconditional-upsert as CAS.
Generation fencing alone is not a working-revision compare-and-swap, and vice versa.
Both the streaming assistant writer and explicit save writer must respect the same
ownership boundary before enabling mutations on their shared message storage.

Unknown write outcome must not trigger model/provider re-execution. Reconcile the
same operation after current authorization; if no authoritative reconciliation is
available, retain unsaved local work and the unknown state. Do not silently retry
under a new identity or promise that a timeout means nothing was saved.

## Follow-up projection and replay

“Use the tracks I selected” sends explicit UI-origin metadata, not fabricated typed
prose: the parent session/chat/message, surface ID/revision, working revision, purpose,
exact bounded selection and recipe-allowlisted changed inputs. UI intent is distinct
from user-authored text. The server resolves that exact revision and authorizes refs
again before constructing a compact model projection. It must not trust a client
supplied value, label, hidden row, rendered DOM, whole page, credential or arbitrary
message history as selection evidence. Reject undeclared fields; do not silently
strip a forged identity and proceed with a different selection.

First scope does not promise a working-revision history store. If another tab has
saved N+1 when a follow-up names N, reject with an explicit stale-working-revision
conflict and retain the initiating draft; never substitute N+1. Historical source
answers remain immutable, but that does not make every old set of controls
addressable. A later revision-history feature requires a separate reviewed contract.

The server includes only purpose-necessary authorized identities, requested fields,
source versions and missing/stale status. Persisted full snapshots are not wholesale
model input. Changed or unavailable selected refs produce an explicit refusal or
user-visible partial-selection choice, never silent substitution or dropped tracks.
Typing alone without a captured selection must not infer the last checked rows.

Read/hydrate/reconnect/duplicate/export performs zero external actions: no tool
execution, provider request, POST replay, publish, purchase, background job or audio
play. Operation receipts render as historical facts, never executable commands.
Text hosts derive the same ordered text from the same authorized revision; unknown
rich capabilities degrade to text. Unknown schema/recipe versions fail safely and
retain an authorized compatible text alternative; fallback is never a way around
withdrawal or permission checks.

## Conflicts, lifecycle and management

| Event                                              | Required result                                                                                                                                                                                                                                                                                                                                                                                           |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Two tabs save from revision N                      | One atomic winner N+1; other gets conflict. Keep its draft, display current authorized revision, offer reload/discard or explicit reapply against the new base. No automatic last-writer-wins or inferred merge of plan edits.                                                                                                                                                                            |
| Late async completion or older streamed answer     | May complete its own immutable historical message; cannot replace newer saved work or bind it to a new surface. Compare captured scope, generation, surface and working revision before adoption.                                                                                                                                                                                                         |
| Removed component or changed recipe/source version | Preserve compatible declared edits only. Mark incompatible selections/edits unavailable and require deliberate rebase; keep original lineage. Do not map by label or visual position.                                                                                                                                                                                                                     |
| Conversation branch/regeneration                   | New assistant/surface identity; original remains historical. Carry state only by explicit authorized duplicate/rebase with parent linkage; no implicit overwrite or external action replay.                                                                                                                                                                                                               |
| Rename                                             | Companion displayName metadata change with expected working revision; never mutate immutable surface.title at the same source revision. Existing chat-title PATCH is separate and must not be repurposed implicitly.                                                                                                                                                                                      |
| Duplicate                                          | New server assistant message anchor plus surface/working identity, explicit parent, exact retained lineage, same authorized workspace only in first scope. Preserve the existing one-surface-per-assistant consumer; do not insert a second surface into the parent message. No copied action authority/receipts as new effects. Destination access must be checked; cross-workspace copy is unsupported. |
| Archive                                            | Hide a working surface by acknowledged revisioned metadata; do not archive its entire session. Session archive can stop a sandbox, so it is not a view-only shortcut. Unarchive reauthorizes.                                                                                                                                                                                                             |
| Account/workspace switch or sign-out               | Abort pending work, invalidate captured intents, clear in-memory scoped content, no save into the new account. Returning requires fresh authorization. Any unsaved discard warning occurs before switch; never retain another account's private draft in a shared cache.                                                                                                                                  |
| Expired media/source access                        | Stop using cached private URLs; resolve current authorization through owner or withhold. Historical observations remain dated, not silently refreshed. Withdrawal removes affected rich/text/model/export content under owner policy.                                                                                                                                                                     |
| Source correction                                  | Preserve historical facts and exact lineage; explicit fresh read gets new source/surface identity. A historical view must not claim current freshness.                                                                                                                                                                                                                                                    |

No existing standalone surface rename/duplicate/archive route is claimed. Implement
these through the same proposed domain/revision contract after acceptance, not
through ordinary chat edit/delete or session lifecycle commands.

## Retention, deletion and export

Current message history inherits the parent chat lifecycle. The inspected migration
cascades session → chats → messages; the chat-delete handler also refuses deleting
the only chat in a session. This is source behavior, not an established retention
period, backup erasure SLA or source-withdrawal policy. Archive is not deletion.

Proposed default linkage: working snapshots remain attached to their existing chat,
without an independent indefinite cache or secondary store. Explicit deletion must
invalidate revision lookup, local replay caches and follow-up projections and must
not allow a late completion to recreate deleted work. Whether per-surface deletion
needs a tombstone within retained conversation history is an owner decision below;
the disabled fencing proposal is not proof of a live tombstone guarantee.

Export requires current ownership/workspace/source checks and the exact revision.
Export only the requested authorized snapshot, controls, exact refs, provenance,
coverage and text; omit secrets, private unrelated rows and action execution data.
A previously downloaded file cannot be remotely revoked. Do not promise that later
source deletion erases copies already exported. Numeric retention periods, backup
expiry and deletion of derivatives follow their owning policies, not a new UI rule.

## Minimal repository sequence and acceptance matrix

This PR hands UI the identity/state/projection contract before shared code changes.
It deliberately does not introduce an unused schema or pretend a prototype save is
durable. A safe runtime slice is not currently available for mutable #2207 saves:
the missing atomic receipt, competing message writer, source reauthorization and
live ref mapping cannot be repaired by a client-only patch.

1. **API + Database:** review exact JSON placement in existing message storage and
   atomic working-revision/idempotency/current-authority semantics, including all
   existing writers and deletion. Reuse existing ownership chain and Supabase
   access layer. Any required SQL belongs to a separate Database proposal/PR, with
   no migration application or fencing enrollment implied by this design.
2. **API:** implement the shared validated operation, explicit acknowledged outcomes,
   reopen/export/follow-up projection and source-owner checks. Keep legacy behavior
   separate until approved integration; do not overload Context `save_brief`.
3. **App:** consume that reviewed API contract with existing full snapshot consumer,
   ObjectRefs, text fallback and scoped lifecycle. Add unsaved/unknown/conflict UX
   and the explicit UI-origin follow-up; no new model loop for local controls.
4. **Hosts:** native/MCP/text call the same domain operation, then run synthetic
   conformance and separately authorized live acceptance. Root coordinates UI/API
   changes and merges. Existing denied actor operations are not repeated here.

| #2207 criterion                                                  | Focused tests required before claiming completion                                                                                                                                                                                                                                                  |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Filters, selected tracks, plan edits, lineage survive            | Full-save/read roundtrip with zero and missing values, exact ObjectRefs and recipe edits; reload/reconnect and second device; failed write remains unsaved; lost ack reconciles without second write/effect. Current source-only history tests cover full message hydration, not these new fields. |
| Exact authorized selection; exclude private fields               | Model projection asserts exact surface/working/source versions and only allowlisted fields; follow-up naming N after N+1 saves rejects without substituting latest; forged/cross-workspace/withdrawn refs reject; an extra hidden field is rejected; UI metadata never masquerades as typed text.  |
| Concurrent edits and no external replay                          | Two clients race same base; exactly one wins; stale completion cannot overwrite; deletion vs completion; changed idempotency payload rejects; hydrate/duplicate/retry/export produce zero external calls.                                                                                          |
| Retention/export/deletion/account switch                         | Delete cascade and chosen tombstone policy; active-run deletion; archive remains distinct; scoped cache clearing and pending-intent cancellation; expired/withdrawn content withheld in both text and rich export; retention policy assertions after owner decision.                               |
| Exact subject/artifact/selection separate from business decision | Catalog subject vs Context ref mismatch refusal; unsupported artifact rejected; source revision separate from working revision; no rights/payment/knowledge acceptance receipt manufactured by save.                                                                                               |
| Reopen native/MCP/text with current authorization                | Same operation and historical revision in all hosts; mid-read/post-save revocation withholding; unsupported rich capability yields authorized same-revision text; two devices under the intended authorized actor plus independent server readback.                                                |

Useful existing regressions to extend, not evidence of new behavior:
App `lib/intelligent-ui/transport/__tests__/chatSnapshotConsumer.test.ts`,
`workflowSnapshots.test.ts`, `lib/intelligent-ui/descriptors/__tests__/descriptors.test.ts`;
API `lib/chat/__tests__/persistAssistantMessage.test.ts`,
`lib/sessions/chats/__tests__/getSessionChatHandler.test.ts`,
`lib/context/__tests__/briefSnapshotTransports.test.ts` (authorization pattern only).

## Decisions genuinely missing from inspected canonical sources

The issues [#2202](https://github.com/recoupable/app/issues/2202),
[#2205](https://github.com/recoupable/app/issues/2205),
[#2206](https://github.com/recoupable/app/issues/2206),
[#2224](https://github.com/recoupable/app/issues/2224) and
[#2240](https://github.com/recoupable/app/issues/2240) establish bounded references,
state separation, explicit follow-ups, existing owning services and text parity.
They do not settle the following; these are design inputs, not new permissions:

- API/Database: exact companion placement and atomic CAS/idempotency/delete protocol
  that coexists with full assistant writes; authoritative transactional membership
  and source-access policy. The disabled chat fence must not be assumed activated.
- Context/Catalog: an authorized live track-to-Context-ref join and artifact-reference
  contract; source-owner withdrawal behavior for saved catalog history. The catalog
  README explicitly has no withdrawal mechanism; tracking disable is not withdrawal.
- Product/data owners: numeric retention/backup expiry and per-surface deletion vs
  retained chat/tombstone policy, with export limitations. No duration is invented.
- Recipe owners: the first allowed plan-edit fields and compatible rebase rules.
  Filters/selection do not authorize arbitrary plan JSON or financial arithmetic.

Until these inputs and the separate live authority gates are resolved, mark #2207
implementation and authenticated persistence readback incomplete. This contract is
ready for review without requiring a new backend, production operation or UI fork.
