import { z } from "zod";

const count = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00Z`);
    return (
      Number.isFinite(parsed.getTime()) &&
      parsed.toISOString().slice(0, 10) === value
    );
  }, "Invalid UTC calendar date");
export const streamRecordingSchema = z.object({
  isrc: z.string(),
  provider_recording_id: z.string().nullable(),
  retrieved_at: z.string().nullable(),
  state: z.string(),
  days: z.array(z.object({ date, streams: count.nullable() })),
});
export const streamHistorySchema = z
  .object({
    catalog_id: z.string(),
    provider: z.literal("luminate"),
    platform: z.literal("all_dsps"),
    territory: z.literal("worldwide"),
    metric: z.literal("daily_streams"),
    periods: z.object({
      current: z.object({ start: date, end_exclusive: date }),
      previous: z.object({ start: date, end_exclusive: date }),
      days: z.number().int().positive().max(31),
      timezone: z.literal("UTC"),
    }),
    pagination: z.object({
      page: count,
      total_count: count,
      has_more: z.boolean(),
    }),
    recordings: z.array(streamRecordingSchema),
  })
  .refine(({ periods }) => {
    const parse = (value: string) => Date.parse(`${value}T00:00:00Z`);
    const duration = periods.days * 86400000;
    return (
      periods.previous.end_exclusive === periods.current.start &&
      parse(periods.previous.end_exclusive) - parse(periods.previous.start) ===
        duration &&
      parse(periods.current.end_exclusive) - parse(periods.current.start) ===
        duration
    );
  }, "Stream comparison periods must be contiguous and equal in length");
export const streamTrackingSchema = z.object({
  catalog_id: z.string(),
  tracking: z.object({ enabled: z.boolean() }).nullable(),
  latest_run: z
    .object({ status: z.string(), finished_at: z.string().nullable() })
    .nullable(),
});
export type StreamRecording = z.infer<typeof streamRecordingSchema>;
export type StreamHistory = z.infer<typeof streamHistorySchema>;
export type StreamTracking = z.infer<typeof streamTrackingSchema>;
export interface StreamPoint {
  date: string;
  streams: number | null;
  observedTracks: number;
}
