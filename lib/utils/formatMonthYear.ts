/**
 * Formats an ISO timestamp as a short month + year, e.g. "Aug 2026".
 * Returns an empty string for unparsable input so callers can render nothing
 * rather than "Invalid Date".
 */
export function formatMonthYear(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
