const compactUsd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

/**
 * Formats a valuation dollar amount compactly ("$1.4M", "$959K") to match
 * the figure shown on the marketing valuation card.
 */
export function formatValuationAmount(amount: number): string {
  return compactUsd.format(amount);
}
