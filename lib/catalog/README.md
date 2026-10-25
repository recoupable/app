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
