import type { UsageSeriesBucket } from "@/lib/recoup/getAccountUsage";

const FORMATS: Record<UsageSeriesBucket, Intl.DateTimeFormatOptions> = {
  hour: { hour: "numeric" },
  day: { month: "short", day: "numeric" },
  week: { month: "short", day: "numeric" },
  month: { month: "short", year: "numeric" },
};

/** The X-axis label for a bucket start, at the bucket's own granularity, in UTC. */
const formatBucketLabel = (start: string, bucket: UsageSeriesBucket): string =>
  new Date(start).toLocaleString("en-US", {
    ...FORMATS[bucket],
    timeZone: "UTC",
  });

export default formatBucketLabel;
