/** Longest filename we will hand the browser, extension included. */
const MAX_FILENAME_LENGTH = 64;

/**
 * A readable filename for a downloaded song.
 *
 * Named after the prompt because that is what the user wrote and the only
 * thing that identifies a song to them; the generation uuid would save as an
 * unrecognisable blob. The extension is taken from the stored object rather
 * than assumed, so a future model returning mp3 still saves correctly.
 *
 * @param prompt - The prompt the song was generated from.
 * @param audioUrl - The stored audio url, used only for its extension.
 * @returns A slugified filename with an extension.
 */
export function musicDownloadFilename(prompt: string, audioUrl: string): string {
  const extension = /\.([a-z0-9]{2,4})(?:$|\?)/i.exec(audioUrl)?.[1]?.toLowerCase() ?? "wav";
  const slug = prompt
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!slug) return `generated-song.${extension}`;

  const room = MAX_FILENAME_LENGTH - extension.length - 1;
  return `${slug.slice(0, room).replace(/-+$/, "")}.${extension}`;
}

/**
 * The url to hang off a download link.
 *
 * The `download` attribute alone is not enough: browsers ignore it for
 * cross-origin urls, and our audio is served from Supabase Storage while the
 * app runs on its own domain. The attribute was therefore dropped and the link
 * behaved like ordinary navigation, replacing the page with a bare audio file.
 *
 * Supabase honours a `download` query parameter by returning
 * `Content-Disposition: attachment`, which forces a real download whatever the
 * origin, so the fix belongs in the url rather than the markup.
 *
 * @param audioUrl - The stored audio url, or null when nothing is ready.
 * @param filename - Name to save the file as.
 * @returns The download url, or null when there is nothing to download.
 */
export function musicDownloadUrl(audioUrl: string | null, filename: string): string | null {
  if (!audioUrl) return null;

  const separator = audioUrl.includes("?") ? "&" : "?";
  return `${audioUrl}${separator}download=${encodeURIComponent(filename)}`;
}
