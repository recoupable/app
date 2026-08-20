import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

export interface RunValuationResult {
  status: string;
  catalog?: { id: string; name: string };
  band?: { low: number; mid: number; high: number };
  songs_measured?: number;
}

/**
 * Kicks `POST /api/valuation` for a Spotify artist (api#776): resolves the
 * artist's releases, measures play counts, and materializes an account-owned
 * catalog + value band. Used fire-and-forget on the first artist add to seed
 * the onboarding catalog, and by the one-click run button (chat#1973).
 *
 * On failure the API's `error` string is thrown **verbatim** — it is the
 * diagnostic ("No releases found for this Spotify artist" exposed a
 * wrong-duplicate profile pick in live use), never to be wrapped in a generic
 * message.
 *
 * @param accessToken - Privy bearer for the owning account.
 * @param spotifyArtistId - The Spotify artist id to value.
 * @param organizationId - Optional organization to own the resulting catalog
 *   (must match the caller's selected organization context, or the catalog
 *   silently lands on the personal account).
 */
export async function runValuation(
  accessToken: string,
  spotifyArtistId: string,
  organizationId?: string,
): Promise<RunValuationResult> {
  const res = await fetch(`${getClientApiBaseUrl()}/api/valuation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      spotify_artist_id: spotifyArtistId,
      ...(organizationId && { organization_id: organizationId }),
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    let apiError: string | undefined;
    try {
      apiError = JSON.parse(detail)?.error;
    } catch {
      // Non-JSON body: fall through to the status-code message.
    }
    throw new Error(apiError || `Valuation failed: HTTP ${res.status}`);
  }

  return res.json();
}
