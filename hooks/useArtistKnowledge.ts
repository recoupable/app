import { useQuery } from "@tanstack/react-query";
import type { KnowledgeBaseEntry } from "@/lib/supabase/getArtistKnowledge";

/**
 *
 * @param artistId
 */
export function useArtistKnowledge(artistId?: string) {
  return useQuery<KnowledgeBaseEntry[]>({
    queryKey: ["artist-knowledge", artistId],
    enabled: Boolean(artistId),
    queryFn: async () => {
      if (!artistId) return [];
      const res = await fetch(`/api/artist?artistId=${encodeURIComponent(artistId)}`);
      if (!res.ok) return [];
      const json = await res.json();
      const knowledges: KnowledgeBaseEntry[] =
        json?.artist?.account_info?.[0]?.knowledges || json?.artist?.knowledges || [];
      return Array.isArray(knowledges) ? knowledges : [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export default useArtistKnowledge;
