"use client";

import MusicDetailText from "./MusicDetailText";
import MusicDetailSettings from "./MusicDetailSettings";
import type { MusicGeneration } from "@/types/Music";

/**
 * A song's full record: prompt, lyrics, settings, and the failure reason if
 * there is one.
 *
 * Shared by the dialog and the standalone page so the two cannot drift. Purely
 * presentational — both callers do their own fetching, because they start from
 * different places: the dialog already holds the card's summary, the page has
 * only an id.
 */
const MusicDetailBody = ({
  generation,
  seed,
  seedPending,
}: {
  generation: MusicGeneration;
  seed: number | null;
  seedPending: boolean;
}) => (
  <div className="space-y-4">
    <MusicDetailText label="Prompt" text={generation.prompt} testId="music-detail-prompt" />
    <MusicDetailText label="Lyrics" text={generation.lyrics} testId="music-detail-lyrics" />
    <MusicDetailSettings generation={generation} seed={seed} seedPending={seedPending} />

    {generation.status === "failed" && generation.error_message && (
      <p className="text-xs text-destructive">{generation.error_message}</p>
    )}
  </div>
);

export default MusicDetailBody;
