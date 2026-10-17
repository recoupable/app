"use client";

import { useEffect, useState } from "react";

/** Persist position only. Restoring a view must never restore playback. */
export function useTimelinePosition(key: string, duration: number) {
  const [position, setPosition] = useState(0);
  const [restoredKey, setRestoredKey] = useState<string | null>(null);
  const restored = restoredKey === key;
  useEffect(() => {
    let value = 0;
    try {
      const raw = localStorage.getItem(key);
      if (raw && raw.length < 64) {
        const parsed: unknown = JSON.parse(raw);
        if (
          typeof parsed === "number" &&
          Number.isFinite(parsed) &&
          parsed >= 0 &&
          parsed <= duration
        )
          value = parsed;
      }
    } catch {
      /* The in-memory view remains usable if storage is unavailable. */
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Browser-only state is restored after hydration.
    setPosition(value);
    setRestoredKey(key);
  }, [key, duration]);
  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem(key, JSON.stringify(position));
    } catch {
      /* In-memory playback is unaffected. */
    }
  }, [key, position, restored]);
  return { position, setPosition, restored };
}
