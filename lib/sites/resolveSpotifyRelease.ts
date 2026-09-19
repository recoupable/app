import { z } from "zod";

const metadataSchema = z.object({
  title: z.string().trim().min(1).max(500),
  thumbnail_url: z.string().url().nullable().optional(),
});

/** Resolve only canonical Spotify URLs; never fetch arbitrary user-controlled hosts. */
export async function resolveSpotifyRelease(link: string) {
  const match =
    /^https:\/\/open\.spotify\.com\/(?:intl-[a-z]+\/)?(track|album|playlist)\/([A-Za-z0-9]+)\/?(?:\?[^<>"']*)?$/.exec(
      link,
    );
  if (!match)
    throw new Error("Paste a Spotify track, album, or playlist link.");
  const url = `https://open.spotify.com/${match[1]}/${match[2]}`;
  const response = await fetch(
    `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`,
    {
      redirect: "error",
      signal: AbortSignal.timeout(12000),
    },
  );
  if (!response.ok)
    throw new Error(
      "Spotify couldn’t find that release. Check the link and try again.",
    );
  const metadata = metadataSchema.parse(await response.json());
  const artwork = metadata.thumbnail_url;
  const safeArtwork =
    artwork &&
    new URL(artwork).protocol === "https:" &&
    [
      "i.scdn.co",
      "image-cdn-ak.spotifycdn.com",
      "image-cdn-fa.spotifycdn.com",
    ].includes(new URL(artwork).hostname)
      ? artwork
      : null;
  return { url, title: metadata.title, artwork: safeArtwork };
}
