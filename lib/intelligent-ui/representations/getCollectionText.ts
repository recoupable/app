import { getCollectionSummary } from "./getCollectionSummary";
import type { CollectionComponent } from "../schema";

/** Static output and local-selection copy use the same supplied strings, never inferred amounts. */
export function getCollectionText(component: CollectionComponent): string {
  return [
    component.title,
    getCollectionSummary(component),
    ...component.rows.map(
      (row) =>
        `${row.label} [${row.id}] — ${component.columns.map((column) => `${column.label}: ${row.values[column.key] ?? "Not supplied"}`).join(" · ")}`,
    ),
    ...(component.rows.length === 0
      ? ["No supplied records. This does not mean zero activity."]
      : []),
  ].join("\n");
}
