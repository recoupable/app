"use client";

import { useState, useEffect } from "react";

/**
 * Computes a live elapsed duration in milliseconds from a task's `startedAt`
 * timestamp (runs.startedAt from the API) that ticks every second.
 *
 * Returns the server-provided `durationMs` once the task has finished.
 * Returns null when the task hasn't started yet.
 *
 * @see https://developers.recoupable.com/api-reference/tasks/runs#response-runs-items-started-at-one-of-0
 */
export function useElapsedMs(
  startedAt: string | null,
  finishedAt: string | null,
  durationMs: number | null,
): number | null {
  // When the task is finished, just return the authoritative server duration.
  // When it hasn't started, return null.
  // While running, tick every second computing Date.now() - startedAt.

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    // Only tick while the task is in-progress (started but not finished).
    if (!startedAt || finishedAt) return;

    // Sync `now` immediately so elapsed is accurate from first render.
    setNow(Date.now());

    const id = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(id);
  }, [startedAt, finishedAt]);

  // Task finished — use the server-provided duration.
  if (finishedAt) return durationMs;

  // Task hasn't started yet.
  if (!startedAt) return null;

  // Task is running — compute elapsed from the task's startedAt timestamp.
  return Math.max(0, now - new Date(startedAt).getTime());
}
