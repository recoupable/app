import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import { UIMessage } from "ai";

/**
 * Load a chat's persisted history from recoup-api
 * `GET /api/sessions/{sessionId}/chats/{chatId}`, which reads the
 * `chat_messages` table (the workflow architecture). Each row's `parts`
 * column stores the full `UIMessage`, so the response `messages` are
 * ready to hand to `useChat` as-is.
 *
 * Returns `[]` on any failure so a history-load error never blocks the
 * chat surface from rendering.
 *
 * @param sessionId - Parent session id (resolved from the chat row).
 * @param chatId - The chat id (equals the legacy room id).
 * @param accessToken - Short-lived Privy JWT for `Authorization`.
 */
const getChatMessages = async (
  sessionId: string,
  chatId: string,
  accessToken: string,
): Promise<UIMessage[]> => {
  try {
    const url = getClientApiBaseUrl();
    const response = await fetch(
      `${url}/api/sessions/${encodeURIComponent(sessionId)}/chats/${encodeURIComponent(chatId)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) return [];

    const data = await response.json();
    return (data?.messages ?? []) as UIMessage[];
  } catch {
    return [];
  }
};

export default getChatMessages;
