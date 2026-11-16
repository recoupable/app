import type { ObjectDescriptor } from "../../descriptors/schemas";
import type { CatalogExplorerRecord } from "./catalogExplorerTypes";

export const catalogFixtureWorkspace = "synthetic:catalog-workspace";
/** Explicit fixture authority: never promotes invented IDs into retained Context subjects. */
export function describeCatalogRecord(
  record: CatalogExplorerRecord,
): ObjectDescriptor {
  return {
    ref: {
      workspaceId: catalogFixtureWorkspace,
      authority: "fixture",
      kind: record.kind,
      id: record.id,
      sourceVersionIds: [record.sourceVersion],
    },
    label: record.label,
    field: {
      value: record.value,
      role: record.role,
      metric: record.metric,
      unit: record.unit,
      currency: record.currency,
      periodStart: record.periodStart,
      periodEnd: record.periodEnd,
      territory: record.territory,
      basis: record.cohort,
      observedAt: record.observedAt,
    },
  };
}
