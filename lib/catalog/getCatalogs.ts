import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import type { Catalog } from "@/types/Catalog";

export interface CatalogsResponse {
  status: string;
  catalogs: Catalog[];
  error?: string;
}

/**
 * Fetches catalogs linked to an account from the Recoup API.
 *
 * Authentication is via Bearer token (Privy access token).
 *
 * @param accountId - The account id whose catalogs to fetch (path segment).
 * @param accessToken - Privy access token for Bearer auth.
 */
export async function getCatalogs(
  accountId: string,
  accessToken: string,
): Promise<CatalogsResponse> {
  try {
    const response = await fetch(
      `${getClientApiBaseUrl()}/api/accounts/${accountId}/catalogs`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data: CatalogsResponse = await response.json();

    if (data.status === "error") {
      throw new Error(data.error || "Unknown error occurred");
    }

    return data;
  } catch (error) {
    console.error("Error fetching catalogs:", error);
    throw error;
  }
}
