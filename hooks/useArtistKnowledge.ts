import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import getArtist from "@/lib/getArtist";
import type { KnowledgeBaseEntry } from "@/lib/supabase/getArtistKnowledge";

export function useArtistKnowledge(artistId?: string) {
  const { getAccessToken, authenticated } = usePrivy();

  return useQuery<KnowledgeBaseEntry[]>({
    queryKey: ["artist-knowledge", artistId],
    enabled: Boolean(artistId) && authenticated,
    queryFn: async () => {
      if (!artistId) return [];
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Please sign in to view artist details");
      }

      const artist = await getArtist(artistId, accessToken);
      const knowledges: KnowledgeBaseEntry[] = artist?.knowledges || [];
      return Array.isArray(knowledges) ? knowledges : [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export default useArtistKnowledge;
