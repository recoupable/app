import type { CatalogSong } from "./getCatalogSongs";
import { analyzeCatalogBatch } from "./analyzeCatalogBatch";

const BATCH_SIZE = 100;

/**
 * Processes batches of songs in parallel using AI filtering
 * Single Responsibility: Coordinate parallel batch processing
 *
 * @param songs
 * @param criteria
 */
export async function processBatchesInParallel(
  songs: CatalogSong[],
  criteria: string,
): Promise<CatalogSong[]> {
  const batches = [];
  for (let i = 0; i < songs.length; i += BATCH_SIZE) {
    batches.push(songs.slice(i, i + BATCH_SIZE));
  }

  const batchPromises = batches.map(batch => analyzeCatalogBatch(batch, criteria));

  const results = await Promise.all(batchPromises);
  return results.flat();
}
