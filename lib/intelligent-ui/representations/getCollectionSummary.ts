import type { CollectionComponent } from "../schema";

export function getCollectionSummary(component: CollectionComponent): string {
  return `${component.rows.length} supplied records. ${component.complete ? "Complete supplied set." : "Partial supplied set."} ${component.totalCount === undefined ? "Total unknown." : `Reported total: ${component.totalCount}.`}`;
}
