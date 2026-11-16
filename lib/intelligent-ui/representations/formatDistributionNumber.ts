const grouped = new Intl.NumberFormat("en", {
  maximumSignificantDigits: 21,
});

/** Preserve accepted numeric values without expanding tiny measurements. */
export function formatDistributionNumber(value: number): string {
  const canonical = String(value);
  return canonical.includes("e") ? canonical : grouped.format(value);
}
