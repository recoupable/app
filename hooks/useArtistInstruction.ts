import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { fetchAuthenticatedArtist } from "@/lib/artists/fetchAuthenticatedArtist";

export function useArtistInstruction(artistId?: string) {
  const { getAccessToken, authenticated } = usePrivy();

  return useQuery<string | undefined>({
    queryKey: ["artist-instruction", artistId, authenticated],
    enabled: Boolean(artistId) && authenticated,
    queryFn: async () => {
      if (!artistId) return undefined;

      const artist = await fetchAuthenticatedArtist(artistId, getAccessToken);
      return artist?.instruction || undefined;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export default useArtistInstruction;
