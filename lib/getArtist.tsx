import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import type { ArtistRecord } from "@/types/Artist";

const getArtist = async (
  artistId: string,
  accessToken: string,
): Promise<ArtistRecord | null> => {
  try {
    const response = await fetch(
      `${getClientApiBaseUrl()}/api/artists/${encodeURIComponent(artistId)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    return data?.artist ?? null;
  } catch {
    return null;
  }
};

export default getArtist;
