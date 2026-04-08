import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import type { ArtistRecord } from "@/types/Artist";

const getArtist = async (
  artistId: string,
  accessToken: string,
) : Promise<ArtistRecord | null> => {
  const response = await fetch(
    `${getClientApiBaseUrl()}/api/artists/${encodeURIComponent(artistId)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(
      responseText
        ? `Failed to fetch artist: ${response.status} ${responseText}`
        : `Failed to fetch artist: ${response.status}`,
    );
  }

  const data = await response.json();

  return data?.artist ?? null;
};

export default getArtist;
