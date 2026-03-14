import { CatalogSongsResponse } from "./getCatalogSongs";

/**
 * Formats an array of artists into a comma-separated string
 * Returns "—" if no artists exist
 *
 * @param artists
 */
export const formatArtists = (artists: CatalogSongsResponse["songs"][0]["artists"]): string => {
  if (!artists || artists.length === 0) return "—";
  return artists.map(artist => artist.name).join(", ");
};
