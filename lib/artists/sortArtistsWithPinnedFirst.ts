import { ArtistRecord } from "@/types/Artist";

/**
 * Sorts artists with pinned artists first, then alphabetically by name.
 */
export function sortArtistsWithPinnedFirst(
  artists: ArtistRecord[],
): ArtistRecord[] {
  return [...artists].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;

    const nameA = a.name?.toLowerCase() || "";
    const nameB = b.name?.toLowerCase() || "";
    return nameA.localeCompare(nameB);
  });
}
