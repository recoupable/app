/**
 * A task date as a short calendar day, "Sep 12".
 *
 * `due_date` arrives as a bare `YYYY-MM-DD`, which `new Date()` reads as UTC
 * midnight — rendered in a negative-offset timezone that shows the day before.
 * A bare date is therefore split by hand instead of parsed.
 */
export function formatTaskDate(value: string | null | undefined): string | null {
  if (!value) return null;

  const bareDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const date = bareDate
    ? new Date(Number(bareDate[1]), Number(bareDate[2]) - 1, Number(bareDate[3]))
    : new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
