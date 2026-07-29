import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

interface DeleteArtistSocialResponse {
  error?: string;
}

/**
 * Unlinks a social profile from an artist via the existing
 * `DELETE /api/artists/{id}/socials/{socialId}` endpoint (Privy bearer auth).
 * The underlying social row is left intact; only the artist link is removed.
 */
export async function deleteArtistSocial(
  accessToken: string,
  artistId: string,
  socialId: string,
): Promise<void> {
  const response = await fetch(
    `${getClientApiBaseUrl()}/api/artists/${artistId}/socials/${socialId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!response.ok) {
    const data: DeleteArtistSocialResponse = await response
      .json()
      .catch(() => ({}));
    throw new Error(data.error || "Failed to remove social");
  }
}
