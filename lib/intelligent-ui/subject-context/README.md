# SubjectContext projection — App #2224 / #2207

`projectSubjectContext(proposed, current)` is a pure adapter for an explicitly
selected follow-up. It returns `{ state: "available", context: SubjectContext }`
or `{ state: "unavailable" }`. This module is the UI handoff seam; no production
send, persistence or snapshot-consumer wiring is included in this PR.

## Input and output

`SubjectContext` contains only:

- `workspaceId`, `surfaceId`, `revision`, `purpose` (existing identifier/revision bounds)
- `subject: ObjectRef`, preserving authority/kind/ID and its complete source-version set
- `selection: ObjectRef[]` (at most eight, explicit selection order retained)

The proposed input is `{ bindingKey, context: SubjectContext }`. `current` is
`{ bindingKey, context: Omit<SubjectContext, "selection">, descriptors }`, typed as
`SubjectContextCurrent`. The current descriptor set is bounded to 200, matching
`CollectionResult`. It must include the focal subject and selected objects, with
one current reference per object. Supply the owning current dataset, not a filtered
visible page; if required refs cannot be supplied, the result is unavailable.
No lookup or automatic expansion occurs.

Use the committed snapshot consumer's opaque lifecycle binding key, including its
epoch, from capture through submission. Obtain current state again immediately
before a follow-up. Never substitute a static workspace ID, old cached binding or
`getSnapshotScopeKey` alone: the lifecycle epoch distinguishes leave-and-return.
The key is bounded to 8192 characters and is never returned in the projection.
Surface identity and revision must come from the currently accepted view, not a
client-invented counter. Purpose is a bounded identifier supplied by the host; this
adapter does not choose or authorize a business operation.

The caller must already have authorized the descriptor dataset and construct
Context refs using `contextObjectRef` from matching confirmed targets and document
lineage. Existing fixture authority stays fixture authority. Row IDs, labels,
provider IDs and names are not ObjectRefs and cannot be passed as selections.

The adapter compares captured/current binding, workspace, surface, revision,
purpose and exact subject ref, then reuses `indexDescriptors` and `resolveSelection`
for subject and selected refs. Source-version order is immaterial; changed identities,
authorities, kinds or version sets are unavailable. Duplicate object rows (even with
different versions) are ambiguous, following the existing CollectionResult rule.
Unknown proposal fields are rejected. The result is detached and contains no labels,
field values, hidden rows, prompts, descriptor metadata or host/account/session keys.
An empty selection remains empty; available rows are never implicitly selected.

## Integration and acceptance boundaries

UI owns capture and consumption of this adapter; it must retain exact refs alongside
local row selections and show unavailable/conflict outcomes without silently replacing
selected subjects or versions. A historical projection cannot be submitted as current
merely by updating its revision: fresh current descriptors and a matching binding are
required. This is local consistency, not backend authority. The server must separately
resolve and authorize any future follow-up against its owning services.

This slice does not implement persisted selection, reload/back/forward recovery,
guest attachment, relationship expansion, a network request schema, grants or an
authenticated backend. It does not add refs to the schema-v1 surface wire format or
claim UI end-to-end acceptance. Those remain joint #2224/#2207 work. Synthetic tests
exercise projection only; no provider calls or hosted writes are involved.
