import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

interface CreateArtistSegmentsResponse {
  status: "success" | "error";
  segments_created?: number;
  message?: string;
  error?: string;
}

/**
 * Creates segments for an artist via the dedicated API.
 *
 * @param accessToken - Privy access token for Bearer auth
 * @param artistId - Artist account ID (path-encoded)
 * @param prompt - Segmentation prompt
 */
export async function createArtistSegments(
  accessToken: string,
  artistId: string,
  prompt: string,
): Promise<void> {
  const response = await fetch(
    `${getClientApiBaseUrl()}/api/artists/${artistId}/segments`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ prompt }),
    },
  );

  const data: CreateArtistSegmentsResponse = await response.json();

  if (!response.ok || data.status !== "success") {
    throw new Error(data.error || "Failed to generate segments");
  }
}
