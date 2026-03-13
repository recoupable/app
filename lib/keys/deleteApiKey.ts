import { NEW_API_BASE_URL } from "@/lib/consts";

/**
 * Delete an API key
 *
 * @param keyId - The ID of the API key to delete
 * @param accessToken - The access token for authentication
 * @returns Promise with the deletion result
 */
export async function deleteApiKey(keyId: string, accessToken: string): Promise<void> {
  const response = await fetch(`${NEW_API_BASE_URL}/api/keys`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ id: keyId }),
  });

  const data = await response.json();

  if (!response.ok || data.status === "error") {
    throw new Error(data.message || "Failed to delete API key");
  }
}
