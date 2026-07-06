import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

export interface CatalogSongMeasurement {
  isrc: string;
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
  measurements: CatalogSongMeasurement[];
  valuation: CatalogValuationBand;
  error?: string;
}

/**
 * Fetches the latest per-ISRC play counts + derived valuation band for a
 * catalog from the Recoup API (recoupable/chat#1850 data-plumbing contract).
 *
 * The endpoint is being rolled out; callers must treat any thrown error as
 * "no valuation available" and fall back gracefully.
 */
export async function getCatalogMeasurements(
  catalogId: string,
  accessToken: string,
): Promise<CatalogMeasurementsResponse> {
  const url = new URL(`${getClientApiBaseUrl()}/api/catalogs/measurements`);
  url.searchParams.set("catalogId", catalogId);

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
