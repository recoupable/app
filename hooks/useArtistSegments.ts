import { type Segment } from "@/lib/supabase/getArtistSegments";
import { useQuery } from "@tanstack/react-query";

/**
 *
 * @param artistId
 */
async function fetchSegments(artistId: string): Promise<Segment[]> {
  const response = await fetch(`/api/segments?artistId=${artistId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch segments");
  }
  const segments: Segment[] = await response.json();
  return segments.filter(s => s.size > 0);
}

/**
 *
 * @param artistId
 */
export function useArtistSegments(artistId?: string) {
  return useQuery({
    queryKey: ["segments", artistId],
    queryFn: () => fetchSegments(artistId!),
    enabled: !!artistId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
