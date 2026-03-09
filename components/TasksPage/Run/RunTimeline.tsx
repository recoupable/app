"use client";

import { formatTimestamp } from "@/lib/tasks/formatTimestamp";
import { formatDuration } from "@/lib/tasks/formatDuration";
import { useElapsedMs } from "@/hooks/useElapsedMs";

interface RunTimelineProps {
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  durationMs: number | null;
}

export default function RunTimeline({
  createdAt,
  startedAt,
  finishedAt,
  durationMs,
}: RunTimelineProps) {
  const displayDuration = useElapsedMs(startedAt, durationMs);

  const items = [
    { label: "Created", value: formatTimestamp(createdAt) },
    startedAt ? { label: "Started", value: formatTimestamp(startedAt) } : null,
    finishedAt
      ? { label: "Finished", value: formatTimestamp(finishedAt) }
      : null,
    displayDuration !== null
      ? { label: "Duration", value: formatDuration(displayDuration) }
      : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="grid grid-cols-2 gap-3 rounded-md border bg-muted/30 px-4 py-3 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label}>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {item.label}
          </p>
          <p className="text-sm font-medium">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
