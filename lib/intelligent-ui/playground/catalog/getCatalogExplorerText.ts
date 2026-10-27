import { getRepresentationText } from "../../representations/getRepresentationText";
import type { CatalogExplorerRecord } from "./catalogExplorerTypes";
import { formatCatalogSourceValue } from "./formatCatalogSourceValue";
import { compareCatalogSelection } from "./compareCatalogSelection";
import type { getCatalogExplorerView } from "./getCatalogExplorerView";

/** Bounded current-page/selection export, with the same basis and refusal as the UI. */
export function getCatalogExplorerText(
  view: ReturnType<typeof getCatalogExplorerView>,
  selected: readonly CatalogExplorerRecord[],
) {
  const comparison = compareCatalogSelection(selected);
  const line = (r: CatalogExplorerRecord) =>
    `${r.id} | ${r.label} | ${formatCatalogSourceValue(r)} | ${r.role} | ${r.metric} | ${r.periodStart ?? "unknown"} to ${r.periodEnd ?? "unknown"} | ${r.territory} | ${r.sourceVersion} | observed ${r.observedAt}`;
  return [
    "SYNTHETIC ONLY. Invented recording observations; no rights, valuation or cash verification.",
    `Fixture: 10,000 supplied recordings. Filter matches: ${view.collection.totalCount}. Current page: ${view.page}/${view.pages}, ${view.rows.length} rows. Page is not a catalog total.`,
    `Filtered coverage: ${view.coverage.known} known, ${view.coverage.unknown} unknown, ${view.coverage.withheld} withheld, ${view.coverage.notApplicable} not applicable. Zero remains zero.`,
    "Fixed fixture reference: 2026-10-26T12:00:00Z; sources observed 2026-10-15T12:00:00Z (11 days old at reference). No freshness claim today.",
    "Hypothetical values are authored examples, not calculated estimates. No scenario method, assumptions or valuation formula is adopted. No historical membership or period inference. Small selections do not establish statistical significance.",
    "CURRENT PAGE",
    ...view.rows.map(line),
    "EXACT LOCAL SELECTION",
    ...selected.map(line),
    comparison.reason ??
      (comparison.distribution
        ? getRepresentationText(comparison.distribution)
        : "Compatible supplied currency values only; no finance aggregation or projection."),
  ].join("\n");
}
