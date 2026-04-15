import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import type { Segment } from "@/types/Segment";

interface MappedArtistSegment {
  id: string;
  name: string;
  size: number;
  icon?: string;
}

interface GetArtistSegmentsResponse {
  status: "success" | "error";
  segments?: MappedArtistSegment[];
  pagination?: {
    total_count: number;
    page: number;
    limit: number;
    total_pages: number;
  };
  error?: string;
}

/**
 * Fetches aggregated segments for an artist from the dedicated API.
 *
 * @param accessToken - Privy access token for Bearer auth
 * @param artistId - Artist account ID (path-encoded)
 * @returns Consumer `Segment[]` shape, filtered to `size > 0`
 */
export async function getArtistSegments(
  accessToken: string,
  artistId: string,
): Promise<Segment[]> {
  const response = await fetch(
    `${getClientApiBaseUrl()}/api/artists/${artistId}/segments`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const data: GetArtistSegmentsResponse = await response.json();

  if (!response.ok || data.status === "error") {
    throw new Error(data.error || "Failed to fetch segments");
  }

  return (data.segments || [])
    .map((s) => ({ id: s.id, name: s.name, size: s.size, icon: s.icon }))
    .filter((s) => s.size > 0);
}
