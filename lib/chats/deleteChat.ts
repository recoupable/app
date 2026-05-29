import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

/**
 * Deletes a session-scoped chat via recoup-api
 * `DELETE /api/sessions/{sessionId}/chats/{chatId}` — cascades to
 * `chat_messages` and `chat_reads`.
 */
export async function deleteChat(
  sessionId: string,
  chatId: string,
  accessToken: string,
): Promise<void> {
  const url = getClientApiBaseUrl();

  const response = await fetch(
    `${url}/api/sessions/${encodeURIComponent(sessionId)}/chats/${encodeURIComponent(chatId)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    const result = await response.json().catch(() => ({}) as { error?: string });
    throw new Error(result.error || "Failed to delete chat");
  }
}
