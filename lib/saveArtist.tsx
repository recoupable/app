import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import type { ArtistRecord } from "@/types/Artist";
import type { Knowledge } from "@/types/knowledge";

interface SaveArtistPayload {
  name?: string;
  image?: string;
  instruction?: string;
  label?: string;
  knowledges?: Knowledge[];
  profileUrls?: Record<string, string>;
  pinned?: boolean;
}

interface SaveArtistResponse {
  artist?: ArtistRecord;
  error?: string;
}

const saveArtist = async (
  accessToken: string,
  artistId: string,
  artistData: SaveArtistPayload,
): Promise<SaveArtistResponse> => {
  const response = await fetch(`${getClientApiBaseUrl()}/api/artists/${artistId}`, {
    method: "PATCH",
    body: JSON.stringify(artistData),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data: SaveArtistResponse = await response.json();

  if (!response.ok || !data.artist) {
    throw new Error(data.error || "Failed to save artist");
  }

  return data;
};

export default saveArtist;
