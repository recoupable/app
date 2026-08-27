/** "Aug 27, 2026, 11:56 AM" in the viewer's locale-neutral en-US form. */
const formatUsageDate = (iso: string, withTime = true): string =>
  new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
    timeZone: "UTC",
  });

export default formatUsageDate;
