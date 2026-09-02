"use client";

import { useEffect, useState } from "react";

/**
 * Advance through `options` on a fixed cadence, wrapping at the end.
 *
 * @param options - Texts to cycle through, shown in order from the first.
 * @param intervalMs - How long each is shown.
 * @returns The current text.
 */
export function useCyclingText(options: readonly string[], intervalMs: number): string {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (options.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % options.length), intervalMs);
    return () => clearInterval(id);
  }, [options, intervalMs]);

  return options[index] ?? options[0] ?? "";
}
