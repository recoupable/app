import { NEW_API_BASE_URL } from "@/lib/consts";

/**
 * Create a new API key for the authenticated account or organization
 *
 * @param keyName - The name for the API key
 * @param accessToken - The access token for authentication
 * @param organizationId - Optional organization ID to create the key for
 * @returns Promise with the created API key
 */
export async function createApiKey(
  keyName: string,
  accessToken: string,
  organizationId?: string | null,
): Promise<string> {
  const body: { key_name: string; organizationId?: string } = {
    key_name: keyName,
  };

  if (organizationId) {
    body.organizationId = organizationId;
  }

  const response = await fetch(`${NEW_API_BASE_URL}/api/keys`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();

  if (!response.ok || data.status === "error") {
    throw new Error(data.message || "Failed to create API key");
  }

  return data.key;
}
