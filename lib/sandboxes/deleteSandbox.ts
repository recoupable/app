import { NEW_API_BASE_URL } from "@/lib/consts";

/**
 *
 * @param accessToken
 */
export async function deleteSandbox(accessToken: string): Promise<void> {
  const response = await fetch(`${NEW_API_BASE_URL}/api/sandboxes`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to delete sandbox");
  }
}
