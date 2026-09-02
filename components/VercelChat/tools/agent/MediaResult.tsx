"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ExtractedMedia } from "@/lib/chat/extractMediaFromStdout";

/**
 * A finished asset, played where it was produced.
 *
 * Rendered under the tool row that made it rather than wherever the agent
 * mentions it in prose — the most important moment in the product used to
 * arrive as a blue hyperlink (recoupable/app#2052).
 */
export function MediaResult({ media }: { media: ExtractedMedia }) {
  const filename = media.url.split(/[?#]/)[0].split("/").pop() || "download";

  return (
    <div className="flex flex-col gap-2">
      {media.kind === "audio" && (
        // eslint-disable-next-line jsx-a11y/media-has-caption -- generated music has no captions
        <audio controls preload="metadata" src={media.url} className="w-full max-w-lg">
          Your browser does not support audio playback.
        </audio>
      )}

      {media.kind === "video" && (
        // eslint-disable-next-line jsx-a11y/media-has-caption -- generated video has no caption track
        <video
          controls
          preload="metadata"
          src={media.url}
          // Height-capped rather than width-capped: a music video is 9:16, and
          // a width-constrained portrait clip fills the whole thread.
          className="max-h-[70vh] w-auto max-w-full rounded-lg border border-border"
        >
          Your browser does not support the video tag.
        </video>
      )}

      {media.kind === "image" && (
        // eslint-disable-next-line @next/next/no-img-element -- generated asset on an external origin
        <img
          src={media.url}
          alt={filename}
          className="max-h-[70vh] w-auto max-w-full rounded-lg border border-border"
        />
      )}

      <Button asChild variant="outline" size="sm" className="w-fit">
        <a href={media.url} download={filename} target="_blank" rel="noreferrer">
          <Download className="mr-2 h-4 w-4" />
          Download
        </a>
      </Button>
    </div>
  );
}
