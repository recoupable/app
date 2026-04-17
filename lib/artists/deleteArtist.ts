import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

interface DeleteArtistResponse {
  success?: boolean;
  error?: string;
}

/**
 * Deletes an artist through the dedicated API.
 *
 * @param accessToken - Privy access token for Bearer auth
 * @param artistId - Artist account ID to delete
 */
export async function deleteArtist(accessToken: string, artistId: string): Promise<void> {
  const response = await fetch(`${getClientApiBaseUrl()}/api/artists/${artistId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data: DeleteArtistResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || "Failed to delete artist");
  }
}
