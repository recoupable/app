import { NEW_API_BASE_URL } from "@/lib/consts";

/**
 * Deletes a chat by ID via the API service.
 */
export async function deleteChat(
  roomId: string,
  accessToken: string,
  baseUrl?: string,
): Promise<void> {
  const url = baseUrl || NEW_API_BASE_URL;

  const response = await fetch(`${url}/api/chats`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ id: roomId }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to delete chat");
  }
}
