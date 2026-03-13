import { CatalogSong } from "./getCatalogSongs";

/**
 * Formats catalog songs into the CSV-like format expected by the scorer
 *
 * @param songs
 */
export function formatCatalogSongsAsCSV(songs: CatalogSong[]): string {
  const csvLines = songs.map(song => {
    const artistNames = song.artists.map(artist => artist.name).join(", ");
    return `${song.isrc},"${song.name}","${song.album}","${artistNames}"`;
  });

  return csvLines.join("\n");
}
