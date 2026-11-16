# Workspace-bound descriptor adapter — App #2222 / #2211

This is a consumed development-explorer slice, not a new Context API or a complete
implementation of #2222. `getCatalogExplorerView` projects the bounded fixture page
through `CollectionResult` to the existing schema-v1 collection. `CatalogExplorer`
captures exact `ObjectRef`s in local selection state; resolution requires workspace,
authority, kind, identity and the complete source-version set to match. A changed
version, duplicate, missing record or wrong workspace returns the same unavailable
result. Labels never resolve identity. A filtered or empty page does not erase a
selection. Nothing is persisted or fetched.

## Authority and source mapping

Reconciled against API `4ed1fdb1c4d1da38c0e179530205102f64d252c3`:

- `lib/supabase/context_requests/listContextRequestTargets.ts`: `subjectId`,
  `kind`, `identityConfirmed`; caller must first authorize the selected owner.
- `lib/context/contracts/contextBriefResponseSchemas.ts`: accepted documents
  preserve `ownerId`, `subjectId`, `sourceVersionIds`. Source versions are UUIDs,
  not a document version counter or a provider ID.
- `lib/context/README.md`: imported names are assertions, not confirmed company
  identity, membership or rights.

`contextObjectRef` is the pure projection seam for an already-authorized target
and its matching document lineage. Its caller must join those records by the same
subject in the same owner scope. It performs no authorization or lookup. It only
accepts confirmed recording, composition, release and company subjects, retaining
UUIDs verbatim. Unresolved name assertions return null. Context's `release` is
preserved as `release`; it is **not** promoted to `release_edition`. Edition,
statement and purchase examples currently use explicit fixture authority only.
The synthetic catalog uses `authority: fixture`, never invented Context UUIDs.
Provider identifiers such as leading-zero strings remain strings.

App base `10fb53f33` retains `lib/intelligent-ui/schema.ts` schemaVersion 1 and its
existing collection constraints. No surface protocol fields or parser changed.
Descriptor refs remain outside that wire shape. Rendered row IDs bind workspace, authority, kind and original identity;
exact selections additionally bind source versions. The projection includes identity,
source-version and cohort-basis columns. Overlong references fail validation rather
than being truncated or hashed ambiguously. The collection adapter renders
catalog, statement and purchase fixtures through the same collection contract.

## Scope and missingness

Known zero, unknown, withheld and not-applicable remain distinct typed states.
Missing states cannot carry a hidden numeric amount. Each field retains its
source-version refs, role, metric, unit/currency, period, territory, cohort basis
and observation timestamp. `knownTotal` counts the supplied/filtered population;
it is not a sum of values. `aggregationScope: page` survives incomplete pagination;
`population` is permitted only for a complete supplied population. Neither means
a whole customer catalog. Fixture page cursors are explicitly local page handles,
not service cursors. Unknown totals are omitted from the legacy renderer, not zero.

Existing `compareCatalogSelection` remains responsible for fixture compatibility:
cohort/source/metric/unit/currency/period/territory differences refuse a distribution;
missingness does not become zero; currency values never acquire finance arithmetic.
This adapter introduces no sum, shares, denominator conversion or scenario method.

## Remaining work

RelationshipRef, temporal/cardinality relationship semantics, domain-owned share
and financial bases, authenticated service projection, durable selection and live
web/MCP parity remain outside this slice. These schemas grant no access; production
callers must authorize and recheck through their owning service before returning
records. The Context account/transport gate is unchanged. No migration, provider,
auth route, model call or production activation is added. The wider #2222 acceptance
(including relationships and domain-specific share arithmetic) remains open.
