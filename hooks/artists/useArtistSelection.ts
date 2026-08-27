"use client";

import { useCallback, useMemo, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import type { ArtistRecord } from "@/types/Artist";

/**
 * Per-org artist selections, persisted to localStorage so the user's
 * pick survives reloads.
 */
type ArtistSelections = Record<string, ArtistRecord>;

const STORAGE_KEY = "RECOUP_ARTIST_SELECTIONS";

/**
 * Owns the active-artist selection for a given (orgKey, roster) pair.
 *
 * Selection precedence in the derived `selectedArtist`:
 *   1. explicit user override from this session (pick/deselect)
 *   2. saved selection from localStorage (per-org)
 *   3. first artist in the roster (auto-pick)
 *
 * The selection is computed in a single render (`useMemo`), so there is
 * no in-between tick where `artists` is populated but `selectedArtist`
 * is still null — which is what previously let
 * `useNewChatBootstrap`'s effect fire twice.
 *
 * `selectedArtist` is re-looked-up against the live `artists` array on
 * every render so consumers always see the latest server-side fields
 * (socials, pinned, knowledges) rather than the snapshot held in
 * the override.
 */
export function useArtistSelection(orgKey: string, artists: ArtistRecord[]) {
  const [selections, setSelections] = useLocalStorage<ArtistSelections>(
    STORAGE_KEY,
    {},
  );

  // Explicit pick/deselect for this session. `artist: null` means
  // user-deselected (saved selection is ignored). `null` outer value
  // means user hasn't interacted yet (fall through to saved → first).
  const [userOverride, setUserOverride] = useState<{
    orgKey: string;
    artist: ArtistRecord | null;
  } | null>(null);

  const selectedArtist = useMemo<ArtistRecord | null>(() => {
    if (userOverride && userOverride.orgKey === orgKey) {
      if (!userOverride.artist) return null;
      return (
        artists.find(
          (a) => a.account_id === userOverride.artist!.account_id,
        ) ?? null
      );
    }
    if (artists.length === 0) return null;
    const saved = selections[orgKey];
    if (saved && Object.keys(saved).length > 0) {
      const found = artists.find((a) => a.account_id === saved.account_id);
      if (found) return found;
    }
    return artists[0];
  }, [artists, selections, orgKey, userOverride]);

  const setSelectedArtist = useCallback(
    (artist: ArtistRecord | null) => {
      setUserOverride({ orgKey, artist });
      if (artist) {
        setSelections((prev) => ({ ...prev, [orgKey]: artist }));
      } else {
        setSelections((prev) => {
          const next = { ...prev };
          delete next[orgKey];
          return next;
        });
      }
    },
    [orgKey, setSelections],
  );

  return { selectedArtist, setSelectedArtist };
}
