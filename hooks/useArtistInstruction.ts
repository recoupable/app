import { useQuery } from "@tanstack/react-query";

/**
 *
 * @param artistId
 */
export function useArtistInstruction(artistId?: string) {
  return useQuery<string | undefined>({
    queryKey: ["artist-instruction", artistId],
    enabled: Boolean(artistId),
    queryFn: async () => {
      if (!artistId) return undefined;
      const res = await fetch(`/api/artist?artistId=${encodeURIComponent(artistId)}`);
      if (!res.ok) return undefined;
      const json = await res.json();
      return json?.artist?.instruction || undefined;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export default useArtistInstruction;
