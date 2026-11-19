import { z } from "zod";
import { objectRefSchema } from "../descriptors/schemas";

const uuid = z
  .string()
  .uuid()
  .refine((value) => value === value.toLowerCase());
const date = z
  .string()
  .date()
  .refine((value) => {
    const time = Date.parse(`${value}T00:00:00Z`);
    return (
      Number.isFinite(time) &&
      new Date(time).toISOString().slice(0, 10) === value
    );
  });
const timestamp = z
  .string()
  .max(64)
  .datetime({ offset: true })
  .refine((value) => Number.isFinite(Date.parse(value)));
const versions = z.array(uuid).length(1);
const method = z
  .object({
    recipe: z.literal("catalog-retained-stream-fields/1"),
    recipeHash: z.literal(
      "65a06a785aa496e1232fe3a9f1606595f19c1a152b710ca30c4c06612f01864a",
    ),
    evaluatorSha256: z.literal(
      "163563e15dd92d473aa51899c54c96300f20d27072b83e39ffb01c84f3adc64e",
    ),
    helperSha256: z.literal(
      "91dcca66c8dec0851c1f6e110257a63b730e9b7ae33a60bceb0e9ffcf318dd81",
    ),
  })
  .strict();
const query = z
  .object({
    since: date,
    days: z.number().int().min(1).max(366),
    timezone: z.literal("UTC"),
  })
  .strict();
const binding = z
  .object({
    ownerId: uuid,
    requestId: uuid,
    subjectId: uuid,
    catalogId: uuid,
    resultId: uuid,
    revision: z.number().int().nonnegative().safe(),
    topic: z.literal("catalog_retained_streams"),
    sourceVersionIds: versions,
  })
  .strict();
const shared = {
  workspaceId: uuid,
  catalogId: uuid,
  field: z.literal("current_streams"),
  method,
  query,
};
export const retainedFieldRequestSchema = z
  .object({
    mode: z.literal("retained_field"),
    ...shared,
    selections: z.array(binding).min(1).max(8),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (
      new Set(value.selections.map((row) => row.subjectId)).size !==
        value.selections.length ||
      value.selections.some(
        (row) =>
          row.ownerId !== value.workspaceId ||
          row.catalogId !== value.catalogId,
      )
    )
      ctx.addIssue({
        code: "custom",
        message: "Selection scope or identity mismatch",
      });
  });
const period = z.object({ start: date, end_exclusive: date }).strict();
const count = z.number().int().min(0).max(732);
export const fieldContextSchema = z
  .object({
    contract: z.literal("catalog-retained-field-projection/1"),
    ...shared,
    asOf: timestamp,
    semantics: z.literal("historical_snapshot"),
    items: z
      .array(
        z
          .object({
            ref: objectRefSchema,
            binding,
            value: z.discriminatedUnion("state", [
              z
                .object({
                  state: z.literal("known"),
                  amount: z.number().int().nonnegative().safe(),
                })
                .strict(),
              z.object({ state: z.literal("unknown") }).strict(),
            ]),
            periods: z
              .object({
                previous: period,
                current: period,
                days: z.number().int().min(1).max(366),
                timezone: z.literal("UTC"),
              })
              .strict(),
            coverage: z
              .object({
                comparisonState: z.enum(["comparable", "incomplete"]),
                absentDateCount: count,
                nullDateCount: count,
                missingDateCount: count,
              })
              .strict(),
            source: z
              .object({
                provider: z.literal("luminate"),
                metric: z.literal("daily_streams"),
                platform: z.literal("all_dsps"),
                territory: z.literal("worldwide"),
                timezone: z.literal("UTC"),
                retrievalRange: z
                  .object({ earliest: timestamp, latest: timestamp })
                  .strict(),
              })
              .strict(),
          })
          .strict(),
      )
      .min(1)
      .max(8),
  })
  .strict()
  .superRefine((value, ctx) => {
    const fail = () =>
      ctx.addIssue({ code: "custom", message: "Field context mismatch" });
    const start = Date.parse(`${value.query.since}T00:00:00Z`);
    const span = value.query.days * 86400000;
    const day = (time: number) => new Date(time).toISOString().slice(0, 10);
    if (
      new Set(value.items.map((row) => row.binding.subjectId)).size !==
      value.items.length
    )
      fail();
    for (const item of value.items) {
      const { ref, binding: row, periods, coverage, source } = item;
      if (
        row.ownerId !== value.workspaceId ||
        row.catalogId !== value.catalogId ||
        ref.workspaceId !== row.ownerId ||
        ref.authority !== "context" ||
        ref.kind !== "recording" ||
        ref.id !== row.subjectId ||
        ref.sourceVersionIds.length !== 1 ||
        ref.sourceVersionIds[0] !== row.sourceVersionIds[0] ||
        periods.days !== value.query.days ||
        periods.current.start !== value.query.since ||
        periods.current.end_exclusive !== day(start + span) ||
        periods.previous.start !== day(start - span) ||
        periods.previous.end_exclusive !== value.query.since ||
        (item.value.state === "known") !==
          (coverage.comparisonState === "comparable") ||
        Date.parse(source.retrievalRange.earliest) >
          Date.parse(source.retrievalRange.latest)
      )
        fail();
    }
  });
export type FieldContext = z.infer<typeof fieldContextSchema>;
export type RetainedFieldRequest = z.infer<typeof retainedFieldRequestSchema>;
