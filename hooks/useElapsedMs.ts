"use client";

import { useState, useEffect } from "react";

/**
 * Returns a live elapsed duration (ms) counting up from a task's `startedAt`
 * timestamp. Stops ticking once `durationMs` becomes available (task finished).
 *
 * @see https://developers.recoupable.com/api-reference/tasks/runs#response-runs-items-started-at-one-of-0
 */
export function useElapsedMs(
  startedAt: string | null,
  durationMs: number | null,
): number | null {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!startedAt || durationMs !== null) return;

    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(id);
  }, [startedAt, durationMs]);

  if (durationMs !== null) return durationMs;
  if (!startedAt) return null;

  return Math.max(0, now - new Date(startedAt).getTime());
}
