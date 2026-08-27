/**
 * Row timestamps read "Aug 27, 6:26 PM" (the period already names the year);
 * period bounds read "Aug 1, 2026". UTC, en-US.
 */
const formatUsageDate = (iso: string, withTime = true): string =>
  new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    ...(withTime
      ? { hour: "numeric", minute: "2-digit" }
      : { year: "numeric" }),
    timeZone: "UTC",
  });
export default formatUsageDate;
