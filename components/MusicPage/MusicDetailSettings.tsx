"use client";

import { formatDuration } from "@/lib/music/formatDuration";
import type { MusicGeneration } from "@/types/Music";

/**
 * The settings a generation actually ran with.
 *
 * Deliberately four rows, not the seven the form collects. fal's result
 * carries `{ audio, seed, duration }` and nothing else: `num_inference_steps`
 * and `guidance_scale` are consumed at submit and never echoed back by any fal
 * endpoint, and we chose not to mirror them into columns of our own
 * (recoupable/api#850). Showing only what genuinely exists beats showing a
 * value we would have had to guess at.
 *
 * @param generation - The card's summary, already in hand when the dialog opens.
 * @param seed - Read live from fal; null while rendering or when unavailable.
 */
const MusicDetailSettings = ({
  generation,
  seed,
}: {
  generation: MusicGeneration;
  seed: number | null;
}) => {
  const rows: { label: string; value: string; testId: string }[] = [
    { label: "Model", value: generation.model, testId: "music-detail-model" },
    { label: "Status", value: generation.status, testId: "music-detail-status" },
    {
      label: "Duration",
      value:
        generation.duration_seconds === null
          ? "Not available"
          : formatDuration(generation.duration_seconds),
      testId: "music-detail-duration",
    },
    {
      label: "Seed",
      value: seed === null ? "Not available" : String(seed),
      testId: "music-detail-seed",
    },
  ];

  return (
    <section>
      <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1.5">
        Settings
      </h3>
      <dl className="rounded-lg bg-muted/40 p-3 text-sm">
        {rows.map(row => (
          <div key={row.label} className="flex items-baseline justify-between gap-3 py-1 min-w-0">
            <dt className="text-muted-foreground shrink-0">{row.label}</dt>
            <dd data-testid={row.testId} className="font-mono text-xs break-all text-right">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
};

export default MusicDetailSettings;
