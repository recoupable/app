const compact = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

/**
 * Compact USD for song-level estimates: 4231.7 → "$4.2K", 87 → "$87".
 */
export function formatUsdEstimate(value: number): string {
  return compact.format(value);
}

/**
 * The hero band: "$84K–$134K" from the valuation model's low/high.
 */
export function formatUsdBand(band: { low: number; mid?: number; high: number }): string {
  return `${compact.format(band.low)}–${compact.format(band.high)}`;
}
