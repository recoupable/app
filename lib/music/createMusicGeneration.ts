import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import type { MusicGeneration } from "@/types/Music";

export interface CreateMusicGenerationBody {
  prompt: string;
  lyrics: string;
  duration?: number;
  seed?: number;
  num_inference_steps?: number;
  guidance_scale?: number;
  account_id?: string;
}

export interface CreateMusicGenerationResponse {
  status: string;
  generation: MusicGeneration;
  error?: string;
}

/**
 * Starts a music generation.
 *
 * Resolves as soon as the API accepts the request (202) — the song is not
 * ready yet, and the caller polls the returned generation.
 *
 * @param accessToken - Privy access token for Bearer auth.
 * @param body - Generation parameters.
 */
export async function createMusicGeneration(
  accessToken: string,
  body: CreateMusicGenerationBody,
): Promise<CreateMusicGenerationResponse> {
  const response = await fetch(`${getClientApiBaseUrl()}/api/music`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // Surface the API's own message: "insufficient_credits" and a rejected
    // lyrics field are both things the user can act on, and a generic
    // "something went wrong" would hide them.
    throw new Error(data?.error || `HTTP ${response.status}`);
  }

  return data as CreateMusicGenerationResponse;
}
