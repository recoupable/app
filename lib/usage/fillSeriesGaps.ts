import type {
  UsageSeriesBucket,
  UsageSeriesPoint,
} from "@/lib/recoup/getAccountUsage";

const floorToBucket = (date: Date, bucket: UsageSeriesBucket): Date => {
  const d = new Date(date);
  d.setUTCMinutes(0, 0, 0);
  if (bucket === "hour") return d;
  d.setUTCHours(0);
  if (bucket === "week")
    d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  if (bucket === "month") d.setUTCDate(1);
  return d;
};

const step = (date: Date, bucket: UsageSeriesBucket): void => {
  if (bucket === "hour") date.setUTCHours(date.getUTCHours() + 1);
  if (bucket === "day") date.setUTCDate(date.getUTCDate() + 1);
  if (bucket === "week") date.setUTCDate(date.getUTCDate() + 7);
  if (bucket === "month") date.setUTCMonth(date.getUTCMonth() + 1);
};

/**
 * The api returns only buckets that had events; the chart wants every bucket
 * from the start of the period to its end, zero where nothing was charged.
 */
const fillSeriesGaps = (
  series: UsageSeriesPoint[],
  bucket: UsageSeriesBucket,
  from: string,
  to: string,
): UsageSeriesPoint[] => {
  const byStart = new Map(series.map((point) => [point.start, point]));
  const filled: UsageSeriesPoint[] = [];
  const end = new Date(to);
  for (
    const cursor = floorToBucket(new Date(from), bucket);
    cursor < end;
    step(cursor, bucket)
  ) {
    const start = cursor.toISOString();
    filled.push(
      byStart.get(start) ?? {
        start,
        credits_deducted: 0,
        usd: "$0.00",
        events: 0,
      },
    );
  }
  return filled;
};

export default fillSeriesGaps;
