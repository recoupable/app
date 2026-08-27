"use client";

import { Skeleton } from "@/components/ui/skeleton";
import MusicDetailBody from "@/components/MusicPage/MusicDetailBody";
import MusicPlayerRow from "@/components/MusicPage/MusicPlayerRow";
import SongDetailHeader from "./SongDetailHeader";
import { MusicGenerationRequestError } from "@/lib/music/getMusicGeneration";
import type { MusicGenerationDetail } from "@/types/Music";

/**
 * The body of the song page for one read state: skeleton, one of three
 * explained errors, or the song itself.
 *
 * A 403 is rendered as a sentence rather than an error. The URL is meant to be
 * passed around, so it will reach people who cannot open it: a forwarded link,
 * someone outside the org. "You do not have access" is the truthful answer and
 * reads nothing like a broken page.
 */
const SongDetailContent = ({
  generation,
  isLoading,
  error,
}: {
  generation: MusicGenerationDetail | undefined;
  isLoading: boolean;
  error: unknown;
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    );
  }

  if (error) {
    const status =
      error instanceof MusicGenerationRequestError ? error.status : null;

    if (status === 403) {
      return (
        <p
          className="text-sm text-muted-foreground"
          data-testid="song-no-access"
        >
          You do not have access to this song. Ask whoever shared it to add you
          to the workspace it belongs to.
        </p>
      );
    }

    if (status === 404) {
      return (
        <p
          className="text-sm text-muted-foreground"
          data-testid="song-not-found"
        >
          This song does not exist. It may have been deleted.
        </p>
      );
    }

    return (
      <p className="text-sm text-destructive" data-testid="song-error">
        Could not load this song. Refresh to try again.
      </p>
    );
  }

  if (!generation) return null;

  return (
    <div className="space-y-4">
      <SongDetailHeader generation={generation} />
      <MusicPlayerRow generation={generation} />
      {(generation.status === "processing" ||
        generation.status === "pending") && (
        <p className="text-xs text-muted-foreground">
          Generating. This usually takes 1 to 2 minutes.
        </p>
      )}

      <MusicDetailBody
        generation={generation}
        seed={generation.seed}
        seedPending={false}
      />
    </div>
  );
};

export default SongDetailContent;
