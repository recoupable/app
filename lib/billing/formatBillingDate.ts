/** "Oct 4, 2026", UTC, en-US. */
const formatBillingDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

export default formatBillingDate;
