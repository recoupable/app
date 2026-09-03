/**
 * The name to save a generated asset under.
 *
 * The CDN's own last path segment is the best name available here — unlike
 * `/api/music`, a tool result carries no prompt to slugify, only the URL that
 * appeared on stdout.
 *
 * @param url - Absolute media URL.
 * @returns A filename, or "download" when the URL has no usable segment.
 */
export function mediaDownloadFilename(url: string): string {
  return url.split(/[?#]/)[0].split("/").pop() || "download";
}
