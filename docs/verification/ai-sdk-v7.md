# AI SDK v7 App qualification

As of 2026-11-18, this is a source-only draft migration from App main
`630d3acae99d50186fa079814f0a2f94efdf7de5`. It succeeds the App #1817 experiment;
App #1816 and Mono #358 track the wider migration. Source qualification is not
release approval or proof of an authenticated App/API round trip.

## Dependency contract

The direct consumer is `ai@7.0.69`, `@ai-sdk/react@4.0.72`, and the public root
export of `@ai-sdk/workflow@1.0.70`. The adapter itself uses ai 7.0.69 and has no
Workflow runtime peer. Provider packages are pinned to the matching provider
4.0.7/provider-utils 5.0.27 contracts. Node 22 is the minimum, including unit CI. Unit CI uses pnpm 9.15.0 and
a frozen install for the checked-in lockfile v9.
This does not install Workflow 5 or override a v6 transport peer. The removed
`@workflow/ai@4.2.0` dependency required ai v6. Its runtime dependency tree accounts
for most lockfile deletions. Pre-existing unrelated peer warnings, including
Composio's ai v5 peer, are not resolved or represented as peer-clean here.

## Resume contract

`ResumableChat` owns send, regeneration and cold-resume assembly through the
exported `Chat` extension APIs and public `readUIMessageStream`. It never mutates
private SDK state. FileList conversion uses the public SDK helper; user editing,
message IDs, regeneration truncation, callbacks and scope/Stop behavior have
focused controls. Admitted chunks retain streaming feedback before a text delta.

A no-start continuation seeds the last saved assistant after the first filtered
byte arrives. It retains prose, metadata, tools and unrelated data parts. An
unmarked explicit start instead opens fresh replay state; a later start creates another
boundary. A start can replace the current assistant, but cannot overwrite an
unrelated user or older assistant. Empty/transient-only resumes create no blank
assistant. Scope disposal suppresses stale publication and callbacks while
releasing the owned loading state. The App triggers resume for the committed
scope and matching ready history; only same-scope requests coalesce. A successor
waits for stale cancellation and rechecks ownership before admission. Stop and
fatal parser errors cancel both the
upstream request and reader. Parser failures and network disconnects retain
distinct completion flags. HTTP 204 from the lazy Workflow reader settles quietly
on both the default and experimental snapshot paths.

HTTP admission, authentication, explicit server Stop, raw chunk cursors,
durability and snapshot filtering remain owned by the existing transport and
lifecycle. This does not implement client tool execution or change server wire
storage. No provider calls, browser acceptance, authenticated checks, merge or
deployment are part of this qualification.

## Canonical continuation protocol

An explicit same-assistant API start can precede a delta whose fallback indexes
are relative to an existing canonical base. Treating it as fresh replay drops
saved text and invalidates those spans. The negotiated start metadata control is
`recoupStream: { version: 1, mode: "continuation", base }`. The decoder requires a
matching assistant ID and canonical message, rejects raw custom/reasoning-file
parts and nested reserved controls, and bounds the complete marker to 1 MiB UTF-8,
2048 parts, depth32 and50000 visited values. It preserves original/proof payloads
inside canonical observations; this is not proof or account authorization.

Both send and resume validate/remove the control before SDK assembly, callbacks
or message persistence, then rebuild from that exact base even when local history
is ahead. Marker-free starts retain full-replay semantics. Invalid/unknown markers
fail before publishing the base. Absolute raw event cursors remain transport-owned.
Only the `useVercelChat` consumer opts in with
`X-Recoup-Stream-Continuation: canonical-base-v1`; the shared transport defaults
to no advertisement, including the plain-SDK first-task report consumer.

The API must bind an explicit protocol to durable run input and gate every
initial/read/resume/terminal response after existing authority checks, including
old clients connecting at a nonzero cursor. Header support alone grants nothing.
Unsupported required mode returns409; unknown stored input cannot default to safe
legacy. A post-start protocol failure reporting `admission: "admitted"` and a
bounded run ID acknowledges the sent draft without resubmitting it or pretending
the failed response was SSE. Synthetic hook tests retain the user message, clear
the accepted draft, and make a retry-draft action a no-op.

`continuation-v1/projection-step.json` preserves the frozen API dfb906dd synthetic
step fixture. Tests initially wrap it in the agreed proposed envelope; this is
not a claim that dfb906dd emits that envelope. Default/snapshot send and resume,
original/partial/fully saved histories, every event cut, byte fragmentation,
invalid marker rejection, start-only bases and exact message equality are covered.
The actual new API producer envelope and frozen paired-source qualification remain
required, as does independent review of the App successor. Legacy App6's fully
saved replay already duplicates parts without the marker; unconditional marker
emission additionally retains control metadata and is not accepted compatibility.

## Evidence and remaining release gates

The direct-SDK regression is retained: no-start resume against the selected SDK
alone creates a second assistant. App tests assert the corrected single-message
behavior without weakening prose, metadata, tool or snapshot expectations.
Independent review added scope, ID-collision, deferred-204 and callback cases.

The `api-6.0.190` fixture bytes, hashes, serializer version and original consumer
manifest are unchanged. Wire tests separately pin the new installed consumers and
check every recorded cut plus byte-at-a-time parsing. The v7 reasoning part's
explicit ID is included in the expected output. This qualifies the new consumer
against historical v6 wire bytes. Separate frozen API 7.0.2 fixtures at commit
`fe8a8738b51de6ab6293cee793cc3accfa9134ec` now pass through the actual App Workflow
transport and coordinator: fragmented SSE, absolute cursor continuation,
finish-only tails, complete JSON message equality and saved legacy usage totals.
See `lib/chat/__fixtures__/api-7.0.2/README.md` for the exact synthetic producer
boundary. These fixtures reconstruct response assembly; they do not execute the
API durable workflow or HTTP routes. Current API application/history/billing
qualification and coordinated release remain cross-repository gates, even when
API and App use different valid v7 versions.

The local sealed compatibility packet preserves the v6 67-test baseline, failing
SDK-only experiments, aligned dependency manifests and proposal review. Its seal
is `1162472ad02c3c9114b223f6fb03b5c6ebac274c68d785f0d86a8d6586e921cd`.
It is local audit evidence, not shipped application code. Current validation is
recorded in the draft PR; the next step after source review is coordinated wire
qualification and explicit release approval. Earlier native acceptance holds
remain separate and unchanged.

Earlier d472 delivery checks on Node 24.18.0 / pnpm 9.15.0: 3,005 tests passed (one
existing performance skip), full nonincremental TypeScript passed, lint completed
with zero errors and 54 warnings, changed-file formatting and contributor-path
checks passed. The production webpack build passed using nonfunctional synthetic
configuration, with optional dependency/deprecation warnings. A frozen offline
install using the existing recorded pnpm store completed; Stagehand's absent
optional evals CLI produced a bin-link warning. These local results are distinct
from the Node 22 GitHub CI result attached to the draft PR.
