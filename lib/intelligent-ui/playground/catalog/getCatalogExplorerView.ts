import type { CollectionComponent } from "../../schema";
import type { CatalogExplorerRecord } from "./catalogExplorerTypes";
import { formatCatalogSourceValue } from "./formatCatalogSourceValue";

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
  const collection: CollectionComponent = {
    type: "collection",
    id: "synthetic-catalog-page",
    title: "Synthetic recordings",
    columns: [
      { key: "value", label: "Source value" },
      { key: "basis", label: "Source basis" },
    ],
    rows: rows.map((r) => ({
      id: r.id,
      label: r.label,
      evidenceIds: [],
      values: {
        value: formatCatalogSourceValue(r),
        basis: `${r.role} · ${r.metric} · ${r.periodStart ?? "period unknown"} to ${r.periodEnd ?? "unknown"} · ${r.territory}`,
      },
    })),
    complete: rows.length === filtered.length,
    totalCount: filtered.length,
  };
  return { rows, collection, coverage, page, pages, hasMore: page < pages };
}
