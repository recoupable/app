/**
 * The next monthly refill, one month after the credits row's timestamp, as
 * "1 Sep". Empty when there is no usable timestamp.
 */
export function formatRefillDate(timestamp: string | null | undefined): string {
  if (!timestamp) return "";
  const last = new Date(timestamp);
  if (Number.isNaN(last.getTime())) return "";
  const next = new Date(Date.UTC(last.getUTCFullYear(), last.getUTCMonth() + 1, last.getUTCDate()));
  return `${next.getUTCDate()} ${next.toLocaleString("en-US", { month: "short", timeZone: "UTC" })}`;
}
