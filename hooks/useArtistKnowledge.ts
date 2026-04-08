import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import getArtist from "@/lib/getArtist";
import type { KnowledgeBaseEntry } from "@/lib/supabase/getArtistKnowledge";

export function useArtistKnowledge(artistId?: string) {
  const { getAccessToken } = usePrivy();

  return useQuery<KnowledgeBaseEntry[]>({
    queryKey: ["artist-knowledge", artistId],
    enabled: Boolean(artistId),
    queryFn: async () => {
      if (!artistId) return [];
      const accessToken = await getAccessToken();
      if (!accessToken) return [];

      const artist = await getArtist(artistId, accessToken);
      const knowledges: KnowledgeBaseEntry[] = artist?.knowledges || [];
      return Array.isArray(knowledges) ? knowledges : [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export default useArtistKnowledge;

