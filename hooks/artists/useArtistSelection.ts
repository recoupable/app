"use client";

import { useCallback } from "react";
import { useLocalStorage } from "usehooks-ts";
import type { ArtistRecord } from "@/types/Artist";

/** A null entry is the intentional, persistent All artists selection. */
export function useArtistSelection(scopeKey: string, artists: ArtistRecord[]) {
  const [selections, setSelections] = useLocalStorage<
    Record<string, ArtistRecord | null>
  >("RECOUP_ARTIST_SELECTIONS", {});
  const saved = selections[scopeKey];
  const selectedArtist =
    artists.find((artist) => artist.account_id === saved?.account_id) ?? null;
  const setSelectedArtist = useCallback(
    (artist: ArtistRecord | null) => {
      setSelections((previous) => ({ ...previous, [scopeKey]: artist }));
    },
    [scopeKey, setSelections],
  );
  return { selectedArtist, setSelectedArtist };
}
