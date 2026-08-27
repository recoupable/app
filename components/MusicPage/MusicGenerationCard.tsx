"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import MusicStatusPill from "./MusicStatusPill";
import MusicPlayerRow from "./MusicPlayerRow";
import { formatDuration } from "@/lib/music/formatDuration";
import type { MusicGeneration } from "@/types/Music";

const MusicGenerationCard = ({
  generation,
}: {
  generation: MusicGeneration;
}) => {
  const router = useRouter();
  const href = `/music/${generation.id}`;
  const isCompleted =
    generation.status === "completed" && !!generation.audio_url;
  // The API returns no title: the prompt is what the user wrote and what
  // identifies the song to them.
  const title = generation.prompt;

  return (
    // min-w-0 because a grid item defaults to min-width:auto and will not
    // shrink below its content. Without it this card rendered 719px wide in a
    // 342px cell on mobile, pushing the player off screen.
    <div
      onClick={() => router.push(href)}
      className="p-4 border rounded-lg min-w-0 cursor-pointer hover:bg-muted/40 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          {/* A real link, so the song has a URL you can copy, open in a new
              tab, or reach by keyboard. It wraps only the title: the download
              below is an anchor, and nesting anchors is invalid HTML. The
              card's onClick covers the rest of the surface for pointer users. */}
          <Link
            href={href}
            aria-label={`View details for ${title}`}
            className="block w-full text-left"
          >
            <h2 className="font-semibold text-base truncate">{title}</h2>
          </Link>
          <p className="text-sm text-muted-foreground mt-0.5">
            {new Date(generation.created_at).toLocaleDateString()}
          </p>
        </div>
        <MusicStatusPill status={generation.status} />
      </div>

      {isCompleted && (
        <div className="mt-3">
          <MusicPlayerRow generation={generation} />
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
