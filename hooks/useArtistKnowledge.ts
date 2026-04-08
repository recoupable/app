import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { fetchAuthenticatedArtist } from "@/lib/artists/fetchAuthenticatedArtist";
import type { KnowledgeBaseEntry } from "@/lib/supabase/getArtistKnowledge";

export function useArtistKnowledge(artistId?: string) {
  const { getAccessToken, authenticated } = usePrivy();

  return useQuery<KnowledgeBaseEntry[]>({
    queryKey: ["artist-knowledge", artistId, authenticated],
    enabled: Boolean(artistId) && authenticated,
    queryFn: async () => {
      if (!artistId) return [];

      const artist = await fetchAuthenticatedArtist(artistId, getAccessToken);
      const knowledges: KnowledgeBaseEntry[] = artist?.knowledges || [];
      return Array.isArray(knowledges) ? knowledges : [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export default useArtistKnowledge;
