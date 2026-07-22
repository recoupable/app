import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import type { ArtistRecord } from "@/types/Artist";

interface CreateArtistResponse {
  artist?: ArtistRecord;
  error?: string;
}

/**
 * Creates a new artist on the roster via the existing Recoup API
 * `POST /api/artists` endpoint (Privy bearer auth — the owning account
 * is inferred from the token). Mirrors `fetchArtists` / `createTask`.
 */
export async function createRosterArtist(
  accessToken: string,
  name: string,
  orgId?: string | null,
): Promise<ArtistRecord> {
  const body: Record<string, string> = { name };
  if (orgId) {
    body.organization_id = orgId;
  }

  const response = await fetch(`${getClientApiBaseUrl()}/api/artists`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  const data: CreateArtistResponse = await response.json();

  if (!response.ok || !data.artist) {
    throw new Error(data.error || "Failed to create artist");
  }

  return data.artist;
}
