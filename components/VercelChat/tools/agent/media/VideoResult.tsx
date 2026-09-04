"use client";

/**
 * A generated clip, played where it was produced.
 *
 * Height-capped rather than width-capped: a music video is 9:16, and a
 * width-constrained portrait clip fills the whole thread.
 *
 * @param url - Absolute video URL from the tool result's stdout.
 */
export function VideoResult({ url }: { url: string }) {
  return (
    <video
      controls
      preload="metadata"
      src={url}
      className="max-h-[70vh] w-auto max-w-full rounded-lg border border-border"
    >
      Your browser does not support the video tag.
    </video>
  );
}
