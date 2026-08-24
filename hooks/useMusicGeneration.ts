import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import {
  getMusicGeneration,
  MusicGenerationResponse,
} from "@/lib/music/getMusicGeneration";

/**
 * Reads one generation's full detail, including the seed fal used.
 *
 * Enabled only while the caller actually needs it, so opening the gallery does
 * not spend a request per song: the detail read costs a fal round trip on the
 * API side, which the list read deliberately avoids.
 *
 * @param generationId - The generation to read, or null for none.
 * @param enabled - Whether to fetch; false while the dialog is closed.
 */
const useMusicGeneration = (
  generationId: string | null,
  enabled: boolean,
): UseQueryResult<MusicGenerationResponse> => {
  const { getAccessToken, authenticated } = usePrivy();

  return useQuery({
    queryKey: ["music-generation", generationId],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("No access token");
      return getMusicGeneration(accessToken, generationId as string);
    },
    enabled: enabled && !!generationId && authenticated,
    refetchOnWindowFocus: false,
  });
};

export default useMusicGeneration;
