"use client";

import { Skeleton } from "@/components/ui/skeleton";
import MusicDetailBody from "@/components/MusicPage/MusicDetailBody";
import MusicStatusPill from "@/components/MusicPage/MusicStatusPill";
import useMusicGeneration from "@/hooks/useMusicGeneration";
import { MusicGenerationRequestError } from "@/lib/music/getMusicGeneration";

/**
 * One song at its own URL.
 *
 * Unlike the dialog, this starts from an id alone — there is no card summary
 * to render from — so it shows a skeleton until the read lands.
 *
 * A 403 is rendered as a sentence rather than an error. The URL is meant to be
 * passed around, so it will reach people who cannot open it: a forwarded link,
 * someone outside the org. "You do not have access" is the truthful answer and
 * reads nothing like a broken page.
 */
const SongDetail = ({ generationId }: { generationId: string }) => {
  const { data, isLoading, error } = useMusicGeneration(generationId, true);
  const generation = data?.generation;

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
    const status = error instanceof MusicGenerationRequestError ? error.status : null;

    if (status === 403) {
      return (
        <p className="text-sm text-muted-foreground" data-testid="song-no-access">
          You do not have access to this song. Ask whoever shared it to add you to the
          workspace it belongs to.
        </p>
      );
    }

    if (status === 404) {
      return (
        <p className="text-sm text-muted-foreground" data-testid="song-not-found">
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
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-heading text-xl font-bold">Song details</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Generated {new Date(generation.created_at).toLocaleString()}
          </p>
        </div>
        <MusicStatusPill status={generation.status} />
      </div>

      <MusicDetailBody generation={generation} seed={generation.seed} seedPending={false} />
    </div>
  );
};

export default SongDetail;
