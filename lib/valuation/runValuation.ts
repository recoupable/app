import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

/**
 * Kicks `POST /api/valuation` for a Spotify artist (api#776): resolves the
 * artist's releases, measures play counts, and materializes an account-owned
 * catalog + value band. Used fire-and-forget on the first artist add to seed
 * the onboarding catalog so "Claim your catalog" is already complete.
 *
 * @param accessToken - Privy bearer for the owning account.
 * @param spotifyArtistId - The Spotify artist id to value.
 */
export async function runValuation(
  accessToken: string,
  spotifyArtistId: string,
): Promise<void> {
  const res = await fetch(`${getClientApiBaseUrl()}/api/valuation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ spotify_artist_id: spotifyArtistId }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Valuation failed: HTTP ${res.status} ${detail}`.trim());
  }
}
