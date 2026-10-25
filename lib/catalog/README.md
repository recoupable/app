# Returned catalog rows

`CatalogSongsResult` shares the same table between catalog pages and chat tool
results. The missing-info filter applies to all returned rows before display
paging. `InsertCatalogSongsList` mounts at most 50 rows, with local First,
Previous, Next and Last controls. These controls do not fetch or call a model.
Changing the filter or catalog starts at the first display page; appending data
keeps the current page, and a shorter replacement clamps to an available page.

The catalog page requests its initial server page through `useCatalogSongs`.
Additional pages require **Load more songs**; mounting or scrolling does not
request them. Pending reads disable that button. A failed additional read keeps
already loaded rows and offers retry. Local display pages and server pages are
different: footer counts describe returned/matching rows, not catalog coverage.
Existing server totals and source fields are preserved. No recording/composition
identity, rights, playcount, comparison or scenario arithmetic is inferred.

This bounds DOM rendering, not total retained query data. The 10,000-row
regression exercises the existing catalog recipe for #2211; hosted performance,
comparison evidence under #2177, generated scenario controls, and source
collection remain separate acceptance. No provider or ingestion is added.

Run `pnpm exec vitest run components/VercelChat/tools/catalog/__tests__ components/Catalog/__tests__`
for paging/filtering, empty states, CSV behavior and explicit-read regressions.

# Saved recording comparisons

`get_catalog_streams` renders `CatalogStreamComparison` through the existing chat
result adapter, including MCP text envelopes. It consumes the API's saved
Luminate worldwide/all-reporting-DSP daily-stream result, bounded to 25 recording
rows. The parser rejects unsupported measurement scope, unequal/nonadjacent UTC
periods, duplicate recording identities and malformed comparable figures. The
API owns comparison state and arithmetic; the browser never sums daily values,
calculates growth, fetches another page or runs a provider.

Only `comparable` rows display supplied figures. Other states withhold figures
and explain missing, invalid or unfinished evidence. Zero baseline keeps actual
zero counts and an undefined percentage. Source recording identity and retrieval
time remain visible in per-recording details. Counts are page-scoped, membership
is current rather than historical, and calendar completeness does not imply
provider freshness. Empty responses do not imply zero streams. Unsupported
results show an explicit unavailable state; existing MCP errors remain intact.

This is the read-only comparison portion of #2211 using #2177's shipped
`getCatalogStreams` contract (API source reviewed at `251ab004`). Synthetic
fixtures qualify presentation, not hosted authorization or provider data.
Scenario controls remain outside this change: the API contract supplies no
approved scenario method, assumptions or financial projection. The existing
10,000-row catalog paging proof applies to the separate catalog-song renderer;
this comparison renderer uses the API's 25-row limit.
