"use client";

import useMusicGeneration from "@/hooks/useMusicGeneration";
import SongBreadcrumb from "./SongBreadcrumb";
import SongDetailContent from "./SongDetailContent";

/**
 * One song at its own URL.
 *
 * Starts from an id alone, so the content shows a skeleton until the read
 * lands. The breadcrumb is outside the read states on purpose: the page is
 * reached from links (a Telegram notification, a pasted URL), and the way
 * back to the gallery must exist before the song loads and when it cannot be
 * shown at all (recoupable/app#1999).
 */
const SongDetail = ({ generationId }: { generationId: string }) => {
  const { data, isLoading, error } = useMusicGeneration(generationId, true);
  const generation = data?.generation;

  return (
    <div className="space-y-4">
      <SongBreadcrumb title={generation?.prompt ?? "Song"} />
      <SongDetailContent
        generation={generation}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
};

export default SongDetail;
