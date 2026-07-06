import type { Catalog } from "@/types/Catalog";

/**
 * Picks which of the account's catalogs the homepage hero should read for
 * the selected artist. Catalog names follow the marketing claim convention
 * ("{Artist} Catalog"), so a case-insensitive name match wins; otherwise
 * the first catalog stands in and the songs-by-artist check in
 * useHomeValuation decides whether the pairing is real (recoupable/chat#1850).
 */
export function findArtistCatalog(
  catalogs: Catalog[] | undefined,
  artistName: string | null | undefined,
): Catalog | undefined {
  if (!catalogs?.length) return undefined;
  if (!artistName) return catalogs[0];

  const needle = artistName.toLowerCase();
  return (
    catalogs.find((catalog) => catalog.name.toLowerCase().includes(needle)) ??
    catalogs[0]
  );
}
