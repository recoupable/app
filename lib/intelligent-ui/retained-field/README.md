# Offline retained-field companion consumer

Source-only prerequisite for App #2207. No chat/history route imports this module;
no live capability is registered. `consumeRetainedField(input)` returns only
`{state:"unavailable"}` by default. The explicit admission object used in tests is
**not an authorization proof**. Its disclosure flag cannot establish a held server
read, current membership, withdrawal state, or permission to display private data.

The inner companion implements API's
[retained-field contract](https://github.com/recoupable/api/blob/30c4d442c75137fa803802091dbb3991f4646e8b/docs/contracts/catalog-field-consumer-2207.md):
`catalog-retained-field-projection/1`, without `state`. The exact method pins come
from that adopted design contract. No executable retained-field App schema existed
at the base; existing ObjectRef, descriptor, collection, surface, text and indexing
contracts are reused instead of copied.

## Proposed offline producer handshake

```ts
import type { Surface } from "../schema";
import type { FieldContext } from "./schemas";

type RetainedFieldPart = {
  type: "data-retained-field-snapshot";
  capability: "retained-field-companion/1";
  data: {
    surface: Surface; // existing strict schema-v1 surface
    fieldContext: FieldContext; // catalog-retained-field-projection/1 without state
  };
};
```

This is a separate, explicitly versioned envelope, not a silent new schema-v1 field.
Legacy parsing still rejects a `fieldContext` property inside a surface. Context's
producer must negotiate this exact envelope and deterministic projection before
integration. It is not a currently accepted chat data part. The reusable executable
example is `__tests__/fixture.ts`; it contains synthetic identities, not an actual
authorized receipt. `projectRetainedField` constructs the exact expected rendering;
consumer rejects any conflicting surface field, answer, row, numeric cell or text.

The admission captures expected request, surface ID/revision and account/workspace/
session/chat/message/generation scope. Changing any scope or full selection binding
refuses the complete output. Its `disclosure` status is an injected offline stand-in
for the missing owning server disclosure integration. Before activation, the real
producer and every initial/replay/history/export/model path must obtain current
server-held authorization for the exact Context result/document/source versions.
No local boolean or successful preparation can replace that requirement.

One current_streams descriptor is indexed per unchanged full ContextObjectRef;
no metric-specific IDs, title inference or parsing display numbers. Query, method,
ordered full binding selection, source versions and reconstructed half-open periods
must agree. Zero stays known zero; unknown has no amount. Descriptor end date is the
last included UTC day; the companion retains both original half-open periods.
Collection population stays partial/page scope with unknown catalog total. Text is
historical and states retrieval is not provider freshness. Companion and all derived
projections are returned together or not at all; there is no fallback or local cache.
Previously returned JavaScript objects cannot be revoked by this pure function. The
owning host must clear them on invalidation; this module makes no erasure claim.

Normalized inner ready JSON including state is bounded to 32 KiB, full received
part to 256 KiB, and displayed text to 24 KiB UTF-8. Additionally, the complete
App ready result (companion, collection, surface, text and descriptor index entries)
must fit 32 KiB before any output is returned. Index entries are counted explicitly
because ordinary JSON serialization hides Map contents. This conservative App
output limit may refuse an otherwise valid eight-item inner payload; it does not
change the API inner-response contract. Excess is rejected, never truncated.
The consumer stores no controls or working state and performs no external action.
Mutable durable working-surface save/reopen remains separate and incomplete.

Run focused tests with `pnpm exec vitest run lib/intelligent-ui/retained-field
lib/intelligent-ui/descriptors/__tests__/descriptors.test.ts`. Tests qualify local
shape/binding/projection/refusal only, not API adapter authority, SQL transaction
locking, disclosure, production deployment or native/account acceptance.

The API-generated synthetic inner payload is copied byte-for-byte into
`__tests__/fixtures/api-fieldContext.json`; `source-pin.json` records API commit
`4ca23de6a6cea3226c2f0392a454eb57861aedf8`, original path and SHA-256.
`producerCompatibility.test.ts` verifies that hash and consumes the payload with
unchanged values, periods, refs and document revision through the proposed outer
envelope. The test derives its expected selection from this synthetic fixture; it
therefore qualifies shape/projection compatibility, **not** independent receipt
origin or authority. Default and unavailable disclosure still withhold all output.

Coverage validation follows the pinned evaluator/helper: absent and null dates are
disjoint, their sum equals missing dates across the two periods, and a comparable
known value has no gaps. Incomplete comparisons are unknown and have at least one
missing date. Counts cannot exceed the actual two-period length. Retrieval must
end at or before `asOf`, and the current period must have ended by that evaluation
time. These consistency checks do not prove provider freshness or authorization.
