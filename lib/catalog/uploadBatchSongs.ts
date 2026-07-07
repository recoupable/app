import { postCatalogSongs, CatalogSongInput } from "./postCatalogSongs";
import { CatalogSong } from "./getCatalogSongs";

const BATCH_SIZE = 1000;

export const uploadBatchSongs = async (
  songs: CatalogSongInput[],
  onProgress?: (current: number, total: number) => void,
) => {
  let allSongs: CatalogSong[] = [];
  const batches = [];
  for (let i = 0; i < songs.length; i += BATCH_SIZE) {
    batches.push(songs.slice(i, i + BATCH_SIZE));
  }

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    onProgress?.(i + 1, batches.length);
    const response = await postCatalogSongs(batch);
    allSongs = [...allSongs, ...response.songs];
  }

  return {
    songs: allSongs,
    pagination: {
      total_count: songs.length,
      page: 1,
      limit: songs.length,
      total_pages: 1,
    },
  };
};
