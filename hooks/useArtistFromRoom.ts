import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { useUserProvider } from "@/providers/UserProvder";
import type { ArtistRecord } from "@/types/Artist";
import { useApiOverride } from "@/hooks/useApiOverride";
import { getChatArtist } from "@/lib/chats/getChatArtist";

/**
 * A hook that automatically selects the artist associated with a room.
 * @param roomId The ID of the room to get the artist for
 */
export function useArtistFromRoom(roomId: string) {
  const { getAccessToken } = usePrivy();
  const { userData } = useUserProvider();
  const { selectedArtist, artists, setSelectedArtist, getArtists } = useArtistProvider();
  const apiOverride = useApiOverride();

  const { data } = useQuery({
    queryKey: ["chatArtist", roomId],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("No access token");
      return getChatArtist(roomId, accessToken, apiOverride ?? undefined);
    },
    enabled: !!roomId && !!userData?.id,
    staleTime: Infinity,
    retry: 2,
  });

  useEffect(() => {
    if (!data?.artist_id || selectedArtist?.account_id === data.artist_id) return;

    const artistList = artists as ArtistRecord[];
    const artist = artistList.find(a => a.account_id === data.artist_id);

    if (artist) {
      setSelectedArtist(artist);
    } else {
      getArtists(data.artist_id);
    }
  }, [data, selectedArtist, artists, setSelectedArtist, getArtists]);
}
