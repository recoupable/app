"use client";

import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { fetchArtists } from "@/lib/artists/fetchArtists";
import type { ArtistRecord } from "@/types/Artist";

interface UseArtistsRosterInput {
  /** Account id of the signed-in user. Roster only fetches when present. */
  userId: string | undefined;
  /** Org context; included in the query key so org switches refetch. */
  orgId: string | null;
}

interface UseArtistsRosterResult {
  artists: ArtistRecord[];
  isLoading: boolean;
  /**
   * Direct cache mutation. Mirrors React's `setState` signature so both
   * `setArtists(newList)` and `setArtists(prev => mutate(prev))` work.
   * Used by `useArtistPinToggle` and `useDeleteArtist` for optimistic
   * updates.
   */
  setArtists: (
    next: ArtistRecord[] | ((prev: ArtistRecord[]) => ArtistRecord[]),
  ) => void;
  /**
   * Imperative refetch that bypasses the staleness check. Returns the
   * fresh list so callers can immediately make selection decisions
   * against it (e.g. select-by-id after creating an artist).
   */
  refetchArtists: () => Promise<ArtistRecord[]>;
}

/**
 * Single source of truth for the user's artist roster. Owns the
 * react-query fetch keyed on `(userId, orgId)` so org switches mint
 * a fresh fetch, plus optimistic-update and refetch helpers.
 *
 * Selection is a separate concern — see `useArtistSelection`.
 */
export function useArtistsRoster({
  userId,
  orgId,
}: UseArtistsRosterInput): UseArtistsRosterResult {
  const { authenticated, getAccessToken } = usePrivy();
  const queryClient = useQueryClient();

  const queryKey = useMemo(
    () => ["artists", userId, orgId] as const,
    [userId, orgId],
  );

  const queryFn = useCallback(async () => {
    const accessToken = await getAccessToken();
    return fetchArtists(accessToken as string, orgId);
  }, [getAccessToken, orgId]);

  // Gate on `authenticated` so the query doesn't fire before Privy
  // issues a token — matches `useConversations` / `useCredits`.
  // Expose `isPending` (true while disabled too) as `isLoading`:
  // v5's `isLoading` flips false while `enabled` is false, which would
  // let `useNewChatBootstrap` fire with `artistId: undefined` during
  // the user-data-loading window.
  const { data: artists = [], isPending } = useQuery({
    queryKey,
    queryFn,
    enabled: !!userId && authenticated,
  });

  const setArtists = useCallback<UseArtistsRosterResult["setArtists"]>(
    (next) => {
      queryClient.setQueryData<ArtistRecord[]>(queryKey, (prev) =>
        typeof next === "function" ? next(prev ?? []) : next,
      );
    },
    [queryClient, queryKey],
  );

  const refetchArtists = useCallback(
    () => queryClient.fetchQuery({ queryKey, queryFn }),
    [queryClient, queryKey, queryFn],
  );

  return { artists, isLoading: isPending, setArtists, refetchArtists };
}
