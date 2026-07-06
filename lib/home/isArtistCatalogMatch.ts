interface ArtistCatalogMatchParams {
  catalogName: string;
  artistName: string;
  songs: { artists?: unknown[] | null }[] | undefined;
}

const artistEntryName = (entry: unknown): string | undefined => {
  if (typeof entry === "string") return entry;
  if (entry && typeof entry === "object" && "name" in entry) {
    const { name } = entry as { name?: unknown };
    if (typeof name === "string") return name;
  }
  return undefined;
};

/**
 * Whether a catalog verifiably belongs to the selected artist: either the
 * catalog is named for the artist (marketing's "{Artist} Catalog" claim
 * convention) or one of its songs carries the artist in `song_artists`.
 * Songs with null/unlinked artists match nobody — the api's `artistName`
 * query filter can't be used for this because it no-ops on unlinked songs
 * (LEFT-join since api#681; see recoupable/chat#1850).
 */
export function isArtistCatalogMatch({
  catalogName,
  artistName,
  songs,
}: ArtistCatalogMatchParams): boolean {
  const needle = artistName.toLowerCase();
  if (catalogName.toLowerCase().includes(needle)) return true;

  return (songs ?? []).some((song) =>
    (song.artists ?? []).some(
      (entry) => artistEntryName(entry)?.toLowerCase() === needle,
    ),
  );
}
