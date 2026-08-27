"use client";

import { Download } from "lucide-react";
import {
  musicDownloadFilename,
  musicDownloadUrl,
} from "@/lib/music/musicDownloadUrl";
import type { MusicGeneration } from "@/types/Music";

/**
 * The native player and the download for a completed song; nothing for any
 * other status. Shared by the gallery card and the song page so the two
 * cannot drift (recoupable/app#1999).
 *
 * The native player carries play, seek, and volume, and stays keyboard
 * accessible without us rebuilding any of it. preload="metadata" fetches only
 * the header, a few KB, so the scrubber shows the real length straight away;
 * with "none" it read 0:00 / 0:00 next to a Completed pill, which looks like an
 * empty file until you press play. flex-1 with a zero basis rather than w-full:
 * a native audio element has a wide intrinsic width and a flex item will not
 * shrink below its content, so w-full rendered the card 719px wide inside a
 * 342px grid cell on mobile.
 *
 * Clicks stop here: inside the card the surface around this row navigates to
 * the song page, and pressing play or saving a song must not.
 */
const MusicPlayerRow = ({ generation }: { generation: MusicGeneration }) => {
  if (generation.status !== "completed" || !generation.audio_url) return null;
  // The API returns no title: the prompt is what the user wrote and what
  // identifies the song to them.
  const title = generation.prompt;
  const downloadHref = musicDownloadUrl(
    generation.audio_url,
    musicDownloadFilename(title, generation.audio_url),
  );

  return (
    <div
      onClick={(event) => event.stopPropagation()}
      className="flex items-center gap-2 min-w-0"
    >
      <audio
        controls
        preload="metadata"
        src={generation.audio_url}
        className="h-9 min-w-0 flex-1 basis-0"
      >
        <track kind="captions" />
      </audio>
      <a
        href={downloadHref ?? undefined}
        download
        aria-label={`Download ${title}`}
        className="shrink-0 inline-flex items-center justify-center size-9 rounded-xl border hover:bg-muted transition-colors"
      >
        <Download className="size-4" />
      </a>
    </div>
  );
};

export default MusicPlayerRow;
