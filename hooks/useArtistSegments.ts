import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { getArtistSegments } from "@/lib/artists/getArtistSegments";

export function useArtistSegments(artistId?: string) {
  const { getAccessToken, authenticated } = usePrivy();
  return useQuery({
    queryKey: ["segments", artistId],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      return getArtistSegments(accessToken!, artistId!);
    },
    enabled: !!artistId && authenticated,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}
