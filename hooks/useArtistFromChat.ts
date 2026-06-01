import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { useUserProvider } from "@/providers/UserProvder";
import type { ArtistRecord } from "@/types/Artist";
import { getSessionById } from "@/lib/sessions/getSessionById";
import { findArtistIdInConversationsCache } from "@/lib/chat/findArtistIdInConversationsCache";

interface UseArtistFromChatParams {
  chatId: string;
  sessionId?: string;
}

/**
 * Selects the artist linked to the open chat without calling the legacy
 * `GET /api/chats/{chatId}/artist` endpoint (404 on workflow chats).
 * Uses `GET /api/sessions/{sessionId}` when available, otherwise the
 * sidebar conversations cache.
 */
export function useArtistFromChat({ chatId, sessionId }: UseArtistFromChatParams) {
  const { getAccessToken } = usePrivy();
  const { userData } = useUserProvider();
  const queryClient = useQueryClient();
  const { selectedArtist, artists, setSelectedArtist, getArtists } = useArtistProvider();

  const { data: sessionData } = useQuery({
    queryKey: ["session", sessionId],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("No access token");
      }
      return getSessionById(sessionId as string, accessToken);
    },
    enabled: !!sessionId && !!userData?.id,
    staleTime: Infinity,
    retry: 1,
  });

  const cachedArtistId = useMemo(
    () => (sessionId ? undefined : findArtistIdInConversationsCache(queryClient, chatId)),
    [sessionId, queryClient, chatId],
  );

  const artistAccountId = sessionId
    ? sessionData?.session.artistId ?? undefined
    : cachedArtistId;

  useEffect(() => {
    if (!artistAccountId || selectedArtist?.account_id === artistAccountId) {
      return;
    }

    const artistList = artists as ArtistRecord[];
    const artist = artistList.find((entry) => entry.account_id === artistAccountId);

    if (artist) {
      setSelectedArtist(artist);
      return;
    }

    getArtists(artistAccountId);
  }, [
    artistAccountId,
    selectedArtist,
    artists,
    setSelectedArtist,
    getArtists,
  ]);
}
