import { CatalogSongsResponse } from "./getCatalogSongs";

/**
 * Formats an array of artists into a comma-separated string
 * Returns "—" if no artists exist
 *
 * The API's left join emits null entries for songs without artist rows
 * (e.g. fresh valuation-claimed catalogs), so null elements and null
 * names must be tolerated despite the declared type.
 */
export const formatArtists = (
  artists: CatalogSongsResponse["songs"][0]["artists"],
): string => {
  const names = (artists ?? [])
    .map((artist) => artist?.name?.trim())
    .filter((name): name is string => !!name);
  return names.length > 0 ? names.join(", ") : "—";
};
