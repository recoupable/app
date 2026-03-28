const imageMimeTypes: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
};

/**
 * Returns the MIME type for an image file based on its path extension.
 */
export function getImageMimeType(path: string): string {
  const ext = path.toLowerCase().split(".").pop() ?? "";
  return imageMimeTypes[ext] ?? "application/octet-stream";
}
