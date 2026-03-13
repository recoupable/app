import type { CatalogSong } from "./getCatalogSongs";
import { processBatchesInParallel } from "./processBatchesInParallel";

const MAX_RESULTS = 1000;

/**
 * Recursively filters song selection until results are under MAX_RESULTS
 * Single Responsibility: Ensure result count stays within LLM context limits
 *
 * @param songs
 * @param criteria
 */
export async function refineResults(
  songs: CatalogSong[],
  criteria: string,
): Promise<CatalogSong[]> {
  if (songs.length <= MAX_RESULTS) return songs;

  // Process in parallel batches - AI naturally selects best matches from whatever set it's given
  const filtered = await processBatchesInParallel(songs, criteria);

  // Recursively refine if still too many
  return refineResults(filtered, criteria);
}
