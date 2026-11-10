"use client";

import { mediaDownloadFilename } from "@/lib/chat/mediaDownloadFilename";

/**
 * A generated still, shown where it was produced.
 *
 * @param url - Absolute image URL from the tool result's stdout.
 */
export function ImageResult({
  url,
  alt,
  onLoad,
  onError,
}: {
  url: string;
  alt?: string;
  onLoad?: () => void;
  onError?: () => void;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- generated asset on an external origin
    <img
      src={url}
      alt={alt ?? mediaDownloadFilename(url)}
      onLoad={onLoad}
      onError={onError}
      className="max-h-[70vh] w-auto max-w-full rounded-lg border border-border"
    />
  );
}
