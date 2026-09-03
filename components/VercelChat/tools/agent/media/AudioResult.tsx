"use client";

/**
 * A generated song, played where it was produced.
 *
 * @param url - Absolute audio URL from the tool result's stdout.
 */
export function AudioResult({ url }: { url: string }) {
  return (
    <audio controls preload="metadata" src={url} className="w-full max-w-lg">
      Your browser does not support audio playback.
    </audio>
  );
}
