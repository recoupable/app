// Utility function to get the first image URL from a Spotify item
/**
 *
 * @param item
 */
export function getSpotifyImage(item: unknown): string | undefined {
  if (typeof item === "object" && item !== null) {
    const obj = item as {
      images?: { url: string }[];
      album?: { images?: { url: string }[] };
    };
    if (obj.images && obj.images.length > 0) {
      return obj.images[0].url;
    }
    if (obj.album && obj.album.images && obj.album.images.length > 0) {
      return obj.album.images[0].url;
    }
  }
  return undefined;
}
