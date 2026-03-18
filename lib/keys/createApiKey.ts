import { NEW_API_BASE_URL } from "@/lib/consts";

/**
 * Create a new API key for the authenticated account
 * @param keyName - The name for the API key
 * @param accessToken - The access token for authentication
 * @returns Promise with the created API key
 */
export async function createApiKey(
  keyName: string,
  accessToken: string
): Promise<string> {
  const response = await fetch(`${NEW_API_BASE_URL}/api/keys`, {
    method: "POST",
    body: JSON.stringify({ key_name: keyName }),
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
