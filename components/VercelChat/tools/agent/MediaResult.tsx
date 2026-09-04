"use client";

import type { ExtractedMedia } from "@/lib/chat/extractMediaFromStdout";
import { AudioResult } from "./media/AudioResult";
import { VideoResult } from "./media/VideoResult";
import { ImageResult } from "./media/ImageResult";
import MessageMediaDownloadButton from "@/components/VercelChat/MessageMediaDownloadButton";
import { useMediaDownloader } from "@/hooks/useMediaDownloader";

const PLAYERS: Record<
  ExtractedMedia["kind"],
  (props: { url: string }) => React.ReactElement
> = {
  audio: AudioResult,
  video: VideoResult,
  image: ImageResult,
};

/**
 * A finished asset, played where it was produced.
 *
 * Rendered under the tool row that made it rather than wherever the agent
 * mentions it in prose — the most important moment in the product used to
 * arrive as a blue hyperlink (recoupable/app#2052).
 *
 * @param media - The asset extracted from the tool result's stdout.
 */
export function MediaResult({ media }: { media: ExtractedMedia }) {
  const Player = PLAYERS[media.kind];
  const { isDownloading, handleDownload } = useMediaDownloader({
    url: media.url,
  });

  return (
    <div className="flex flex-col gap-2">
      <Player url={media.url} />
      <MessageMediaDownloadButton
        label="Download"
        onClick={handleDownload}
        isDownloading={isDownloading}
      />
    </div>
  );
}
