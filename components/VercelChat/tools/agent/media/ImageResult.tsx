"use client";

import { mediaDownloadFilename } from "@/lib/chat/mediaDownloadFilename";

/**
 * A generated still, shown where it was produced.
 *
 * @param url - Absolute image URL from the tool result's stdout.
 */
export function ImageResult({ url }: { url: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- generated asset on an external origin
    <img
      src={url}
      alt={mediaDownloadFilename(url)}
      className="max-h-[70vh] w-auto max-w-full rounded-lg border border-border"
    />
  );
}
