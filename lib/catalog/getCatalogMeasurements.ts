import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

export interface CatalogSongMeasurement {
  isrc: string;
  /** Song title from the measurement capture. Absent on pre-v2 deployments. */
  title?: string | null;
  playcount?: number | null;
  measured_at?: string | null;
}

export interface CatalogValuationBand {
  low: number;
  mid: number;
  high: number;
}

export interface CatalogMeasurementsResponse {
  status: string;
  /** One page of latest-per-ISRC rows (page/limit window), playcount desc. */
  measurements: CatalogSongMeasurement[];
  /**
   * Total measured songs in scope — a whole-scope SQL aggregate, independent
   * of the requested page. Absent on pre-v2 deployments, whose numbers come
   * from a capped read and must not be trusted.
   */
  measured_song_count?: number;
  /**
   * Whole-scope lifetime stream total (same SQL aggregate). Absent on pre-v2
   * deployments — callers fall back to summing the page they got.
   */
  total_streams?: number;
  valuation: CatalogValuationBand;
  /**
   * Echoes the artist filter the api actually applied: the uuid when the
   * response is artist-scoped, null when whole-catalog, and absent on
   * pre-v2 deployments that ignore the param — callers requesting an
   * artist scope must verify this echo before trusting the numbers.
   */
  artist_account_id?: string | null;
  /**
   * Catalog age (years) derived server-side from the earliest Spotify
   * release date, defaulting to 5. Absent on pre-v2 deployments.
   */
  catalog_age_years?: number;
  error?: string;
}

/**
 * Fetches one page of the latest per-ISRC play counts + the whole-scope
 * aggregates (measured_song_count, derived valuation band) for a catalog
 * from the Recoup API (recoupable/chat#1850 data-plumbing contract),
 * optionally scoped to one artist account via artist_account_id. Pass a
 * small limit when only the aggregates matter (the hero uses limit 1).
 *
 * The endpoint is being rolled out; callers must treat any thrown error as
 * "no valuation available" and fall back gracefully.
 */
export async function getCatalogMeasurements(
  catalogId: string,
  accessToken: string,
  artistAccountId?: string,
  limit?: number,
): Promise<CatalogMeasurementsResponse> {
  // Path for identity, query for the optional modifiers (chat#1850 REST
  // decision — mirrors /api/research/albums/{id}/measurements).
  const url = new URL(
    `${getClientApiBaseUrl()}/api/catalogs/${encodeURIComponent(catalogId)}/measurements`,
  );
  if (artistAccountId) {
    url.searchParams.set("artist_account_id", artistAccountId);
  }
  if (limit) {
    url.searchParams.set("limit", String(limit));
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const data: CatalogMeasurementsResponse = await response.json();

  if (data.status === "error") {
    throw new Error(data.error || "Failed to fetch catalog measurements");
  }

  return data;
}
