"use client";

import { useState, useEffect } from "react";
import { formatTimestamp } from "@/lib/tasks/formatTimestamp";
import { formatDuration } from "@/lib/tasks/formatDuration";

interface RunTimelineProps {
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  durationMs: number | null;
}

/**
 * Computes a live elapsed duration from `startedAt` that ticks every second.
 * Returns null when there is no startedAt or the task has already finished.
 */
function useElapsedMs(
  startedAt: string | null,
  finishedAt: string | null,
): number | null {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    // Only tick while the task is in-progress.
    if (!startedAt || finishedAt) return;

    const id = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(id);
  }, [startedAt, finishedAt]);

  if (!startedAt || finishedAt) return null;

  return Math.max(0, now - new Date(startedAt).getTime());
}

export default function RunTimeline({
  createdAt,
  startedAt,
  finishedAt,
  durationMs,
}: RunTimelineProps) {
  const elapsedMs = useElapsedMs(startedAt, finishedAt);

  // Use the server-provided duration when the task is done,
  // otherwise use the live elapsed timer.
  const displayDuration = durationMs ?? elapsedMs;

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
