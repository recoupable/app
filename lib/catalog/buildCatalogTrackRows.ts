import type { CatalogSong } from "./getCatalogSongs";
import type { CatalogSongMeasurement } from "./getCatalogMeasurements";

/** Preserve returned observations; only unique, exact ISRC metadata joins are safe. */
export function buildCatalogTrackRows(
  measurements: CatalogSongMeasurement[],
  songs: CatalogSong[] = [],
) {
  const metadata = new Map<string, CatalogSong | null>();
  for (const song of songs) {
    if (song?.isrc)
      metadata.set(song.isrc, metadata.has(song.isrc) ? null : song);
  }
  return measurements.map((measurement) => {
    const song = measurement.isrc ? metadata.get(measurement.isrc) : undefined;
    const count = measurement.playcount;
    return {
      isrc: measurement.isrc,
      title:
        song?.name?.trim() || measurement.title?.trim() || "Untitled track",
      artist:
        song?.artists
          ?.flatMap((artist) => (artist?.name ? [artist.name] : []))
          .join(", ") || "Unknown artist",
      playcount:
        typeof count === "number" && Number.isSafeInteger(count) && count >= 0
          ? count
          : null,
      measuredAt: measurement.measured_at || null,
    };
  });
}
