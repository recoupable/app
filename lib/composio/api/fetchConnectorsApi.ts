import { NEW_API_BASE_URL } from "@/lib/consts";
import type { ConnectorInfo } from "@/hooks/useConnectors";

/**
 * Fetch connectors from the API.
 *
 * @param accessToken - Bearer token for authentication
 * @param accountId - Optional account ID to scope connectors to (e.g., artist ID)
 * @returns Array of connector info objects
 */
export async function fetchConnectorsApi(
  accessToken: string,
  accountId?: string,
): Promise<ConnectorInfo[]> {
  const url = new URL(`${NEW_API_BASE_URL}/api/connectors`);
  if (accountId) {
    url.searchParams.set("account_id", accountId);
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch connectors");
  }

  const data = await response.json();
  return Array.isArray(data?.connectors) ? data.connectors : [];
}
