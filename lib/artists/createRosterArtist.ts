import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import type { ArtistRecord } from "@/types/Artist";

interface CreateArtistResponse {
  artist?: ArtistRecord;
  error?: string;
}

export interface CreateRosterArtistResult {
  artist: ArtistRecord;
  /** false when the API linked an existing canonical (HTTP 200) instead of creating (201). */
  created: boolean;
}

/**
 * Creates a new artist on the roster via the Recoup API `POST /api/artists`
 * endpoint (Privy bearer auth — the owning account is inferred from the
 * token). With a `spotifyArtistId` the API resolves-or-creates the canonical
 * artist for that id — one canonical per Spotify id, shared across accounts
 * (chat#1889 row 8) — and attaches the SPOTIFY social server-side, so callers
 * must not PATCH it on afterwards.
 */
export async function createRosterArtist(
  accessToken: string,
  name: string,
  orgId?: string | null,
  spotifyArtistId?: string,
): Promise<CreateRosterArtistResult> {
  const body: Record<string, string> = { name };
  if (orgId) {
    body.organization_id = orgId;
  }
  if (spotifyArtistId) {
    body.spotify_artist_id = spotifyArtistId;
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

  return { artist: data.artist, created: response.status === 201 };
}
