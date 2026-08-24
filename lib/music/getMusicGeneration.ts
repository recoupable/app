import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import type { MusicGenerationDetail } from "@/types/Music";

export interface MusicGenerationResponse {
  status: string;
  generation: MusicGenerationDetail;
  error?: string;
}

/**
 * Fetches one music generation, including the seed and progress timeline the
 * API reads live from fal.
 *
 * @param accessToken - Privy access token for Bearer auth.
 * @param generationId - The generation to read.
 */
export async function getMusicGeneration(
  accessToken: string,
  generationId: string,
): Promise<MusicGenerationResponse> {
  const response = await fetch(
    `${getClientApiBaseUrl()}/api/music/${encodeURIComponent(generationId)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return response.json();
}
