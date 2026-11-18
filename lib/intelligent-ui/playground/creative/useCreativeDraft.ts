"use client";
import { useEffect, useState } from "react";
import { readCreativeDraft } from "./readCreativeDraft";
import type { CreativeDraft } from "./types";

/** The caller keys the mounted editor by scope; storage is local, bounded and non-authoritative. */
export function useCreativeDraft(scope: string) {
  const key = `recoup:creative-fixture:v1:${scope}`;
  const [draft, setDraft] = useState<CreativeDraft>({
    version: 1,
    selection: null,
    notes: [],
  });
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("Restoring local notes…");
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      const saved = readCreativeDraft(raw);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Browser storage is restored only after hydration.
      if (saved) setDraft(saved);
      setMessage(
        raw && !saved
          ? "Stored draft could not be read. Start a new local selection."
          : "Stored only in this browser. Not approved or published.",
      );
    } catch {
      setMessage(
        "Browser storage unavailable. Changes last only while this view is open.",
      );
    }
    setReady(true);
  }, [key]);
  const update = (next: CreativeDraft) => {
    if (!ready) return;
    setDraft(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
      setMessage("Stored only in this browser. Not approved or published.");
    } catch {
      setMessage(
        "Browser storage unavailable. Changes last only while this view is open.",
      );
    }
  };
  return { draft, ready, message, update };
}
