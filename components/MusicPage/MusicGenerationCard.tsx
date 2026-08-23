"use client";

import { Download } from "lucide-react";
import MusicStatusPill from "./MusicStatusPill";
import { formatDuration } from "@/lib/music/formatDuration";
import type { MusicGeneration } from "@/types/Music";

const MusicGenerationCard = ({ generation }: { generation: MusicGeneration }) => {
  const isCompleted = generation.status === "completed" && !!generation.audio_url;
  // The API returns no title: the prompt is what the user wrote and what
  // identifies the song to them.
  const title = generation.prompt;

  return (
    // min-w-0 because a grid item defaults to min-width:auto and will not
    // shrink below its content. Without it this card rendered 719px wide in a
    // 342px cell on mobile, pushing the player off screen.
    <div className="p-4 border rounded-lg min-w-0">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="font-semibold text-base truncate">{title}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {new Date(generation.created_at).toLocaleDateString()}
          </p>
        </div>
        <MusicStatusPill status={generation.status} />
      </div>

      {isCompleted && (
        <div className="mt-3 flex items-center gap-2 min-w-0">
          {/* The native player carries play, seek, and volume, and stays
              keyboard accessible without us rebuilding any of it.
              preload="metadata" fetches only the header, a few KB, so the
              scrubber shows the real length straight away. With "none" it read
              0:00 / 0:00 next to a Completed pill, which looks like an empty
              file until you press play.

              flex-1 with a zero basis rather than w-full: a native audio
              element has a wide intrinsic width and a flex item will not
              shrink below its content, so w-full rendered the card 719px wide
              inside a 342px grid cell on mobile. */}
          <audio
            controls
            preload="metadata"
            src={generation.audio_url ?? undefined}
            className="h-9 min-w-0 flex-1 basis-0"
          >
            <track kind="captions" />
          </audio>
          <a
            href={generation.audio_url ?? undefined}
            download
            aria-label={`Download ${title}`}
            className="shrink-0 inline-flex items-center justify-center size-9 rounded-xl border hover:bg-muted transition-colors"
          >
            <Download className="size-4" />
          </a>
        </div>
      )}

      {generation.status === "processing" || generation.status === "pending" ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Generating. This usually takes 1 to 2 minutes.
        </p>
      ) : null}

      {generation.status === "failed" && (
        <p className="mt-3 text-xs text-destructive">
          {generation.error_message || "Generation failed."}
        </p>
      )}

      {isCompleted && generation.duration_seconds !== null && (
        <p className="mt-2 text-xs text-muted-foreground">
          {formatDuration(generation.duration_seconds)}
        </p>
      )}
    </div>
  );
};

export default MusicGenerationCard;
