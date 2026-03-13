import { getCatalogSongs, type CatalogSong } from "./getCatalogSongs";
import { refineResults } from "./refineResults";

const BATCH_SIZE = 100;

export interface AnalyzeFullCatalogOptions {
  catalogId: string;
  criteria: string;
}

/**
 * Fetches all songs from a catalog and filters them using AI in parallel batches
 * Following Open-Closed Principle: open for extension (custom filtering logic), closed for modification
 *
 * @param root0
 * @param root0.catalogId
 * @param root0.criteria
 */
export async function analyzeFullCatalog({
  catalogId,
  criteria,
}: AnalyzeFullCatalogOptions): Promise<{
  results: CatalogSong[];
  totalSongs: number;
  totalPages: number;
}> {
  // Fetch first page to get total count
  const firstPage = await getCatalogSongs(catalogId, BATCH_SIZE, 1);
  const totalPages = firstPage.pagination.total_pages;
  const totalSongs = firstPage.pagination.total_count;

  // Fetch all pages in parallel
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  const pagePromises = pageNumbers.map(async pageNum =>
    pageNum === 1 ? firstPage.songs : (await getCatalogSongs(catalogId, BATCH_SIZE, pageNum)).songs,
  );

  const allPages = await Promise.all(pagePromises);
  const allSongs = allPages.flat();

  // Recursively filter and refine until results are under MAX_RESULTS
  const results = await refineResults(allSongs, criteria);

  return {
    results,
    totalSongs,
    totalPages,
  };
}
