import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import getArtist from "@/lib/getArtist";

export function useArtistInstruction(artistId?: string) {
  const { getAccessToken } = usePrivy();

  return useQuery<string | undefined>({
    queryKey: ["artist-instruction", artistId],
    enabled: Boolean(artistId),
    queryFn: async () => {
      if (!artistId) return undefined;
      const accessToken = await getAccessToken();
      if (!accessToken) return undefined;

      const artist = await getArtist(artistId, accessToken);
      return artist?.instruction || undefined;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export default useArtistInstruction;

