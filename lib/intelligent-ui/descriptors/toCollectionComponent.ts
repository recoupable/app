import { objectRowId } from "./objectRowId";
import type { CollectionComponent } from "../schema";
import {
  collectionResultSchema,
  type CollectionResult,
} from "./collectionResult";

/** Retains the existing schema-v1 renderer; numeric totals describe membership, not summed measures. */
export function toCollectionComponent(
  input: CollectionResult,
): CollectionComponent {
  const result = collectionResultSchema.parse(input);
  return {
    type: "collection",
    id: "synthetic-catalog-page",
    title: result.population,
    columns: [
      { key: "value", label: "Source value" },
      { key: "basis", label: "Source basis" },
      { key: "identity", label: "Exact identity" },
      { key: "sources", label: "Source versions" },
    ],
    rows: result.items.map((item) => ({
      // Version changes retain subject row identity; exact selections bind versions separately.
      id: objectRowId(item.ref),
      label: item.label,
      evidenceIds: [],
      values: {
        identity: `${item.ref.authority} · ${item.ref.kind} · ${item.ref.id}`,
        sources: item.ref.sourceVersionIds.join(", "),
        value:
          item.field.value.state === "known"
            ? `${item.field.value.amount} ${item.field.currency ?? item.field.unit ?? "unit unknown"}`
            : item.field.value.state,
        basis: `${item.field.role} · ${item.field.metric} · ${item.field.basis} · ${item.field.periodStart ?? "period unknown"} to ${item.field.periodEnd ?? "unknown"} · ${item.field.territory} · ${result.aggregationScope} scope`,
      },
    })),
    complete: result.completeness === "complete",
    ...(result.knownTotal === null ? {} : { totalCount: result.knownTotal }),
  };
}
