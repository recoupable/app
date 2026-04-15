import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import type { Segment } from "@/types/Segment";

/**
 * Shape returned by the dedicated `GET /api/artists/{id}/segments` endpoint.
 * We map this into the existing consumer `Segment[]` shape so components
 * (`SegmentsWrapper`, `FanGroupNavItem`, `MiniMenu`) do not change.
 */
interface MappedArtistSegment {
  id: string;
  name: string;
  size: number;
  icon?: string;
}

interface ArtistSegmentsResponse {
  status: string;
  segments: MappedArtistSegment[];
  pagination: {
    total_count: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

async function fetchSegments(
  artistId: string,
  accessToken: string,
): Promise<Segment[]> {
  const response = await fetch(
    `${getClientApiBaseUrl()}/api/artists/${artistId}/segments`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch segments: ${response.status}`);
  }
  const data: ArtistSegmentsResponse = await response.json();
  return data.segments
    .map((s) => ({
      id: s.id,
      name: s.name,
      size: s.size,
      icon: s.icon,
    }))
    .filter((s) => s.size > 0);
}

export function useArtistSegments(artistId?: string) {
  const { getAccessToken, authenticated } = usePrivy();
  return useQuery({
    queryKey: ["segments", artistId],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      return fetchSegments(artistId!, accessToken!);
    },
    enabled: !!artistId && authenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
