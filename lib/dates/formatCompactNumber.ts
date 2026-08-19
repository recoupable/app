/**
 * Compact count formatting for tight layouts: 128441 → "128.4K",
 * 1234567 → "1.2M"; values under 1,000 stay plain.
 */
export function formatCompactNumber(value: number): string {
  if (value < 1000) return String(value);
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}
