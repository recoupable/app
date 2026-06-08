import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { useUserProvider } from "@/providers/UserProvder";
import type { ArtistRecord } from "@/types/Artist";
import { getSessionById } from "@/lib/sessions/getSessionById";

interface UseArtistFromChatParams {
  sessionId?: string;
}

/**
 * Selects the artist linked to the open chat from its session's `artistId`
 * (`GET /api/sessions/{sessionId}`), so opening a chat switches the active
 * artist to that chat's artist. Replaces the legacy
 * `GET /api/chats/{chatId}/artist` call, which 404s on workflow chats.
 *
 * Every chat is reached via the canonical
 * `/sessions/{sessionId}/chats/{chatId}` route, so `sessionId` is always
 * available — no chatId-only fallback is needed (the legacy `/chat/:id`
 * route was removed in chat#1765).
 */
export function useArtistFromChat({ sessionId }: UseArtistFromChatParams) {
  const { getAccessToken } = usePrivy();
  const { userData } = useUserProvider();
  const userId = userData?.id;
  const { selectedArtist, artists, setSelectedArtist, getArtists } =
    useArtistProvider();

  const { data: sessionData } = useQuery({
    queryKey: ["session", userId, sessionId],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("No access token");
      }
      return getSessionById(sessionId as string, accessToken);
    },
    enabled: !!sessionId && !!userId,
    staleTime: Infinity,
    retry: 1,
  });

  const artistAccountId = sessionData?.session.artistId ?? undefined;

  useEffect(() => {
    if (!artistAccountId || selectedArtist?.account_id === artistAccountId) {
      return;
    }

    const artistList = artists as ArtistRecord[];
    const artist = artistList.find(
      (entry) => entry.account_id === artistAccountId,
    );

    if (artist) {
      setSelectedArtist(artist);
      return;
    }

    getArtists(artistAccountId);
  }, [artistAccountId, selectedArtist, artists, setSelectedArtist, getArtists]);
}
