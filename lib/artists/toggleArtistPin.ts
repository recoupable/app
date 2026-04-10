import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

interface ToggleArtistPinResponse {
  success?: boolean;
  artistId?: string;
  pinned?: boolean;
  error?: string;
}

/**
 * Updates an artist's pinned state through the dedicated API.
 *
 * @param accessToken - Privy access token for Bearer auth
 * @param artistId - Artist account ID to pin or unpin
 * @param pinned - Desired pinned state
 */
export async function toggleArtistPin(
  accessToken: string,
  artistId: string,
  pinned: boolean,
): Promise<void> {
  const response = await fetch(`${getClientApiBaseUrl()}/api/artists/pin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      artistId,
      pinned,
    }),
  });

  const data: ToggleArtistPinResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || "Failed to toggle artist pin");
  }
}
