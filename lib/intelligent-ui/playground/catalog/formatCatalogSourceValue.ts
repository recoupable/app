import type { CatalogExplorerRecord } from "./catalogExplorerTypes";

/** Preserve source numbers and missingness; never coerce a gap to zero. */
export function formatCatalogSourceValue(
  record: CatalogExplorerRecord,
): string {
  if (record.value.state !== "known") return record.value.state;
  return `${String(record.value.amount)} ${record.currency ?? record.unit ?? "unit missing"}`;
}
