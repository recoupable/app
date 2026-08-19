// minimumFractionDigits and trailingZeroDisplay are set explicitly because
// compact-currency defaults vary across ICU builds ("$84K" vs "$84.0K").
const compact = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
  trailingZeroDisplay: "stripIfInteger",
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
