/**
 * Compact count for valuation display: 23B / 118M / 952.
 * Mirrors marketing/lib/valuation/formatCompact.ts.
 *
 * @param n - Count (streams, followers)
 */
export function formatCompact(n: number): string {
  return Intl.NumberFormat("en", { notation: "compact" }).format(n);
}
