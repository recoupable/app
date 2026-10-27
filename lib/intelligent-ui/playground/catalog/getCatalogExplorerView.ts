import { toCollectionComponent } from "../../descriptors/toCollectionComponent";
import type { CollectionResult } from "../../descriptors/collectionResult";
import {
  describeCatalogRecord,
  catalogFixtureWorkspace,
} from "./describeCatalogRecord";
import type { CatalogExplorerRecord } from "./catalogExplorerTypes";

/** Local in-memory query; only the bounded page enters the portable collection. */
export function getCatalogExplorerView(
  records: readonly CatalogExplorerRecord[],
  options: { query: string; cohort: string; descending: boolean; page: number },
) {
  const query = options.query.trim().toLowerCase();
  const filtered = records.filter(
    (r) =>
      (options.cohort === "all" || r.cohort === options.cohort) &&
      `${r.label} ${r.id}`.toLowerCase().includes(query),
  );
  filtered.sort((a, b) => {
    const left = `${a.label}\u0000${a.id}`,
      right = `${b.label}\u0000${b.id}`;
    return (
      (left < right ? -1 : left > right ? 1 : 0) * (options.descending ? -1 : 1)
    );
  });
  const pages = Math.max(1, Math.ceil(filtered.length / 25));
  const page = Math.max(
    1,
    Math.min(
      pages,
      Number.isFinite(options.page) ? Math.floor(options.page) : 1,
    ),
  );
  const rows = filtered.slice((page - 1) * 25, page * 25);
  const coverage = { known: 0, unknown: 0, withheld: 0, notApplicable: 0 };
  for (const row of filtered)
    coverage[
      row.value.state === "not-applicable" ? "notApplicable" : row.value.state
    ]++;
  const descriptors: CollectionResult = {
    workspaceId: catalogFixtureWorkspace,
    items: rows.map(describeCatalogRecord),
    nextCursor: page < pages ? `fixture-page:${page + 1}` : null,
    hasMore: page < pages,
    knownTotal: filtered.length,
    completeness: rows.length === filtered.length ? "complete" : "partial",
    aggregationScope: "page",
    population: "Synthetic recordings",
    selection: [],
  };
  const collection = toCollectionComponent(descriptors);
  return {
    rows,
    collection,
    descriptors,
    coverage,
    page,
    pages,
    hasMore: page < pages,
  };
}
