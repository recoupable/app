/** Missing membership totals cannot be inferred from loaded or measured rows. */
export function getCatalogSongTotal(value: unknown): number | undefined {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0
    ? value
    : undefined;
}
