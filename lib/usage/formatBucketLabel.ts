import type { UsageSeriesBucket } from "@/lib/recoup/getAccountUsage";

const FORMATS: Record<
  Exclude<UsageSeriesBucket, "month">,
  Intl.DateTimeFormatOptions
> = {
  hour: { hour: "numeric" },
  day: { month: "short", day: "numeric" },
  week: { month: "short", day: "numeric" },
};

/** The X-axis label for a bucket start, at the bucket's own granularity, in UTC ("2 PM", "Aug 27", "Aug ’26"). */
const formatBucketLabel = (
  start: string,
  bucket: UsageSeriesBucket,
): string => {
  const date = new Date(start);
  if (bucket === "month") {
    const month = date.toLocaleString("en-US", {
      month: "short",
      timeZone: "UTC",
    });
    return `${month} ’${String(date.getUTCFullYear()).slice(-2)}`;
  }
  return date.toLocaleString("en-US", { ...FORMATS[bucket], timeZone: "UTC" });
};
export default formatBucketLabel;
