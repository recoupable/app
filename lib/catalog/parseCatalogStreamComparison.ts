import { z } from "zod";

const count = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const date = z.string().date();
const period = z.object({ start: date, end_exclusive: date });
const recording = z
  .object({
    isrc: z.string().min(1).max(100),
    name: z.string().max(1000).nullable(),
    provider_recording_id: z.string().min(1).max(1000).nullable(),
    retrieved_at: z.string().datetime({ offset: true }).nullable(),
    state: z.enum([
      "comparable",
      "incomplete",
      "invalid_observation",
      "unfinished_period",
    ]),
    missing_days: z.array(date).max(732),
    previous_streams: count.nullable(),
    current_streams: count.nullable(),
    absolute_growth: z
      .number()
      .int()
      .min(-Number.MAX_SAFE_INTEGER)
      .max(Number.MAX_SAFE_INTEGER)
      .nullable(),
    percentage_growth: z.number().finite().nullable(),
    zero_baseline: z.boolean(),
  })
  .refine(
    (row) =>
      row.state !== "comparable" ||
      (row.previous_streams !== null &&
        row.current_streams !== null &&
        row.absolute_growth !== null &&
        row.provider_recording_id !== null &&
        row.retrieved_at !== null &&
        row.missing_days.length === 0 &&
        row.zero_baseline === (row.previous_streams === 0) &&
        (row.zero_baseline
          ? row.percentage_growth === null
          : row.percentage_growth !== null)),
  );
const schema = z
  .object({
    catalog_id: z.string().uuid(),
    provider: z.literal("luminate"),
    platform: z.literal("all_dsps"),
    territory: z.literal("worldwide"),
    metric: z.literal("daily_streams"),
    summary_scope: z.literal("page"),
    source_updated_at: z.string().datetime({ offset: true }).nullable(),
    periods: z.object({
      previous: period,
      current: period,
      days: z.number().int().min(1).max(366),
      timezone: z.literal("UTC"),
    }),
    pagination: z.object({
      page: count.min(1),
      limit: count.min(1).max(25),
      total_count: count,
      has_more: z.boolean(),
    }),
    recordings: z.array(recording).max(25),
  })
  .refine((data) => {
    const { previous, current, days } = data.periods;
    return (
      previous.end_exclusive === current.start &&
      Date.parse(previous.end_exclusive) - Date.parse(previous.start) ===
        days * 86400000 &&
      Date.parse(current.end_exclusive) - Date.parse(current.start) ===
        days * 86400000 &&
      data.recordings.length <= data.pagination.limit &&
      data.recordings.length <= data.pagination.total_count &&
      new Set(data.recordings.map((row) => row.isrc)).size ===
        data.recordings.length
    );
  });

export type CatalogStreamComparisonData = z.infer<typeof schema>;

/** Validate the saved page contract; the API owns comparability and all growth arithmetic. */
export function parseCatalogStreamComparison(
  value: unknown,
): CatalogStreamComparisonData | null {
  const result = schema.safeParse(value);
  return result.success ? result.data : null;
}
