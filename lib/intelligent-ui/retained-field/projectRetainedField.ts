import { collectionResultSchema } from "../descriptors/collectionResult";
import { toCollectionComponent } from "../descriptors/toCollectionComponent";
import { getCollectionText } from "../representations/getCollectionText";
import { surfaceSchema } from "../schema";
import { fieldContextSchema, type FieldContext } from "./schemas";

/** Offline deterministic projection; a field context is not an authorization lease. */
export function projectRetainedField(
  input: FieldContext,
  id: string,
  revision: number,
) {
  const context = fieldContextSchema.parse(input);
  const result = collectionResultSchema.parse({
    workspaceId: context.workspaceId,
    items: context.items.map((item) => ({
      ref: item.ref,
      label: item.binding.subjectId,
      field: {
        value: item.value,
        role: "observed",
        metric: "current_streams",
        unit: "streams",
        currency: null,
        periodStart: item.periods.current.start,
        periodEnd: new Date(
          Date.parse(`${item.periods.current.end_exclusive}T00:00:00Z`) -
            86400000,
        )
          .toISOString()
          .slice(0, 10),
        territory: "worldwide",
        basis:
          "Computed sum of retained Luminate daily streams; retrieval time is not provider freshness.",
        observedAt: item.source.retrievalRange.latest,
      },
    })),
    nextCursor: null,
    hasMore: false,
    knownTotal: null,
    completeness: "partial",
    aggregationScope: "page",
    population: "Selected recordings; catalog total unknown",
    selection: context.items.map((item) => item.ref),
  });
  const component = {
    ...toCollectionComponent(result),
    id: "retained-field-recordings",
  };
  const periods = context.items[0].periods;
  const text = [
    `Historical retained values; evaluated as of ${context.asOf}. Not a currentness lease.`,
    `Previous period [${periods.previous.start}, ${periods.previous.end_exclusive}); current period [${periods.current.start}, ${periods.current.end_exclusive}); ${periods.days} days, UTC.`,
    "Retrieval timestamps describe retrieval, not provider freshness.",
    ...context.items.map(
      (item) =>
        `${item.binding.subjectId}: retrieved ${item.source.retrievalRange.earliest} to ${item.source.retrievalRange.latest}.`,
    ),
    getCollectionText(component),
  ].join("\n");
  const surface = surfaceSchema.parse({
    schemaVersion: 1,
    id,
    revision,
    title: "Historical retained streams",
    description:
      "Selected recordings only; catalog total unknown. Retrieval time is not provider freshness.",
    context: {
      workspaceId: context.workspaceId,
      subject: {
        kind: "catalog",
        id: context.catalogId,
        label: context.catalogId,
      },
    },
    components: [component],
    evidence: [],
    fallbackText: text,
  });
  return { collection: result, surface, text };
}
