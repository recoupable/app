import { CatalogSongsResult } from "@/components/VercelChat/tools/catalog/CatalogSongsResult";
import { CatalogSongsResponse } from "./getCatalogSongs";

/**
 * Creates a CatalogSongsResult from paginated catalog data
 *
 * @param pages
 */
export const createCatalogResult = (pages: CatalogSongsResponse[]): CatalogSongsResult => {
  const allSongs = pages.flatMap(page => page.songs);
  const totalCount = pages[0].pagination.total_count;

  return {
    success: true,
    songs: allSongs,
    pagination: {
      total_count: totalCount,
      page: pages.length,
      limit: 50,
      total_pages: pages[0].pagination.total_pages,
    },
    total_added: totalCount,
    message: `Found ${totalCount} songs in catalog`,
  };
};
