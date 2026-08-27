import type { UsageRange } from "@/lib/usage/usageRanges";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

/**
 * The api `from`/`to` for a range: `to` is now, `from` is the span earlier.
 * Hours and days are exact spans; months walk the calendar (3m from Aug 27
 * is May 27), which is what a reader expects of "3 months".
 */
const rangeToPeriod = (
  range: UsageRange,
  now: Date,
): { from: string; to: string } => {
  const from = new Date(now);
  if (range === "24h") from.setTime(now.getTime() - DAY);
  if (range === "7d") from.setTime(now.getTime() - 7 * DAY);
  if (range === "30d") from.setTime(now.getTime() - 30 * DAY);
  if (range === "3m") from.setUTCMonth(now.getUTCMonth() - 3);
  if (range === "12m") from.setUTCMonth(now.getUTCMonth() - 12);
  if (range === "24m") from.setUTCMonth(now.getUTCMonth() - 24);
  return { from: from.toISOString(), to: now.toISOString() };
};

export default rangeToPeriod;
