import { NEW_API_BASE_URL } from "@/lib/consts";
import { Tables } from "@/types/database.types";

export type ApiKey = Tables<"account_api_keys">;

/**
 * Fetch API keys for the authenticated account or organization
 *
 * @param accessToken - The access token for authentication
 * @param organizationId - Optional organization ID to fetch keys for
 * @returns Promise with the list of API keys
 */
export async function fetchApiKeys(
  accessToken: string,
  organizationId?: string | null,
): Promise<ApiKey[]> {
  const url = new URL(`${NEW_API_BASE_URL}/api/keys`);
  if (organizationId) {
    url.searchParams.set("organizationId", organizationId);
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();

  if (!response.ok || data.status === "error") {
    throw new Error(data.message || "Failed to fetch API keys");
  }

  return data.keys || [];
}
