import type {
  CatalogStreamRelease,
  StreamCatalogSong,
} from "./catalogStreamTypes";
/** Album labels group saved catalog rows locally; they do not establish canonical DSP release identity. */
export function buildCatalogStreamReleases(
  songs: StreamCatalogSong[],
): CatalogStreamRelease[] {
  const groups = new Map<string | null, CatalogStreamRelease>();
  for (const song of songs) {
    const album = song.album?.trim() || null;
    const group = groups.get(album) ?? {
      id: JSON.stringify(album),
      title: album ?? "Unassigned recordings",
      recordings: [],
      complete: true,
    };
    group.recordings.push({
      title: song.name?.trim() || song.isrc,
      isrc: /^[A-Z]{2}[A-Z0-9]{3}\d{7}$/.test(song.isrc) ? song.isrc : null,
    });
    groups.set(album, group);
  }
  return [...groups.values()].sort((a, b) => a.title.localeCompare(b.title));
}
