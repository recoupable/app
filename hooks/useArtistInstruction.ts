import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import getArtist from "@/lib/getArtist";

export function useArtistInstruction(artistId?: string) {
  const { getAccessToken, authenticated } = usePrivy();

  return useQuery<string | undefined>({
    queryKey: ["artist-instruction", artistId, authenticated],
    enabled: Boolean(artistId) && authenticated,
    queryFn: async () => {
      if (!artistId) return undefined;
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Please sign in to view artist details");
      }

      const artist = await getArtist(artistId, accessToken);
      return artist?.instruction || undefined;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export default useArtistInstruction;
