import type { FieldContext, RetainedFieldRequest } from "../schemas";
import { projectRetainedField } from "../projectRetainedField";
import { id } from "./id";
export function fixture() {
  const method = {
    recipe: "catalog-retained-stream-fields/1" as const,
    recipeHash:
      "65a06a785aa496e1232fe3a9f1606595f19c1a152b710ca30c4c06612f01864a" as const,
    evaluatorSha256:
      "163563e15dd92d473aa51899c54c96300f20d27072b83e39ffb01c84f3adc64e" as const,
    helperSha256:
      "91dcca66c8dec0851c1f6e110257a63b730e9b7ae33a60bceb0e9ffcf318dd81" as const,
  };
  const request: RetainedFieldRequest = {
    mode: "retained_field",
    workspaceId: id(1),
    catalogId: id(2),
    field: "current_streams",
    method,
    query: { since: "2026-10-01", days: 2, timezone: "UTC" },
    selections: [0, 1].map((n) => ({
      ownerId: id(1),
      requestId: id(3),
      subjectId: id(10 + n),
      catalogId: id(2),
      resultId: id(20 + n),
      revision: 4 + n,
      topic: "catalog_retained_streams",
      sourceVersionIds: [id(30 + n)],
    })),
  };
  const fieldContext: FieldContext = {
    contract: "catalog-retained-field-projection/1",
    workspaceId: request.workspaceId,
    catalogId: request.catalogId,
    field: request.field,
    method,
    query: request.query,
    asOf: "2026-10-04T00:00:00Z",
    semantics: "historical_snapshot",
    items: request.selections.map((binding, n) => ({
      ref: {
        workspaceId: binding.ownerId,
        authority: "context",
        kind: "recording",
        id: binding.subjectId,
        sourceVersionIds: binding.sourceVersionIds,
      },
      binding,
      value: n ? { state: "unknown" } : { state: "known", amount: 0 },
      periods: {
        previous: { start: "2026-09-29", end_exclusive: "2026-10-01" },
        current: { start: "2026-10-01", end_exclusive: "2026-10-03" },
        days: 2,
        timezone: "UTC",
      },
      coverage: {
        comparisonState: n ? "incomplete" : "comparable",
        absentDateCount: n,
        nullDateCount: 0,
        missingDateCount: n,
      },
      source: {
        provider: "luminate",
        metric: "daily_streams",
        platform: "all_dsps",
        territory: "worldwide",
        timezone: "UTC",
        retrievalRange: {
          earliest: "2026-10-03T01:00:00Z",
          latest: "2026-10-03T02:00:00Z",
        },
      },
    })),
  };
  const scope = {
    accountId: id(90),
    workspaceId: id(1),
    sessionId: id(91),
    chatId: id(92),
    messageId: id(93),
    generation: 1,
  };
  return {
    part: {
      type: "data-retained-field-snapshot" as const,
      capability: "retained-field-companion/1" as const,
      data: {
        fieldContext,
        surface: projectRetainedField(fieldContext, "retained-1", 1).surface,
      },
    },
    admission: {
      capability: "retained-field-companion/1" as const,
      disclosure: "available" as const,
      capturedScope: { ...scope },
      currentScope: { ...scope },
      surfaceId: "retained-1",
      surfaceRevision: 1,
      request: structuredClone(request),
    },
  };
}
