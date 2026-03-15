import { CatalogSongsResult } from "@/components/VercelChat/tools/catalog/CatalogSongsResult";
import { SongsByIsrcResponse } from "./getSongsByIsrc";

/**
 * Creates a CatalogSongsResult from ISRC search data
 *
 * @param searchData
 * @param catalogId
 * @param activeIsrc
 */
export const createSearchResult = (
  searchData: SongsByIsrcResponse,
  catalogId: string,
  activeIsrc: string,
): CatalogSongsResult => ({
  success: searchData.status === "success",
  songs: searchData.songs.map(song => ({
    ...song,
    catalog_id: catalogId,
  })),
  pagination: {
    total_count: searchData.songs.length,
    page: 1,
    limit: searchData.songs.length,
    total_pages: 1,
  },
  total_added: searchData.songs.length,
  message:
    searchData.songs.length > 0
      ? `Found ${searchData.songs.length} song(s) for ISRC: ${activeIsrc}`
      : `No songs found for ISRC: ${activeIsrc}`,
  error: searchData.error,
});
