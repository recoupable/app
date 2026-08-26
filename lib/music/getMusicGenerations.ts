import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import type { MusicGeneration } from "@/types/Music";

export interface MusicGenerationsResponse {
  status: string;
  generations: MusicGeneration[];
  error?: string;
}

/**
 * Fetches the account's music generations from the Recoup API.
 *
 * @param accessToken - Privy access token for Bearer auth.
 * @param accountId - Optional account override, for reading an account other
 *   than the caller's own.
 */
export async function getMusicGenerations(
  accessToken: string,
  accountId?: string,
): Promise<MusicGenerationsResponse> {
  const query = accountId ? `?account_id=${encodeURIComponent(accountId)}` : "";
  const response = await fetch(`${getClientApiBaseUrl()}/api/music${query}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return response.json();
}
