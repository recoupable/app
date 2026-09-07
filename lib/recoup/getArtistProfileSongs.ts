import type {
  ArtistProfileCatalog,
  ArtistProfileSong,
} from "./getArtistProfile";

/** Flatten catalog sources into one artist discography, retaining each ISRC once. */
export function getArtistProfileSongs(
  catalogs: ArtistProfileCatalog[],
): ArtistProfileSong[] {
  const songs = new Map<string, ArtistProfileSong>();
  // Catalogs arrive newest-first; keep the first row when a recording is shared.
  for (const catalog of catalogs) {
    for (const song of catalog.songs) {
      if (!songs.has(song.isrc)) songs.set(song.isrc, song);
    }
  }
  return [...songs.values()].sort((a, b) => b.plays - a.plays);
}
