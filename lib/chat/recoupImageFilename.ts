/**
 * The date-stamped name a generated image saves under, e.g.
 * `Recoup Image May 15, 2025, 09_59_47 PM`.
 *
 * Kept as-is from the original image downloader: a CDN hash means nothing to
 * someone looking at their downloads folder, and this name is already what
 * customers have been getting.
 *
 * @param now - Clock, injectable for tests.
 * @returns A human-readable filename with no extension.
 */
export function recoupImageFilename(now: Date = new Date()): string {
  const date = now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const time = now
    .toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })
    .replace(/:/g, "_");

  return `Recoup Image ${date}, ${time}`;
}
