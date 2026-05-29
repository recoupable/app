import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

/**
 * Chat row as returned by recoup-api `GET /api/chats/{chatId}`
 * (camelCase wire format from `toChatResponse`).
 */
export interface ApiChat {
  id: string;
  sessionId: string | null;
  title: string | null;
  modelId: string | null;
  activeStreamId: string | null;
  lastAssistantMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface GetChatResponse {
  chat: ApiChat;
}

/**
 * Fetch a chat row (incl. `sessionId`) from recoup-api
 * `GET /api/chats/{chatId}`. Lets an existing `/chat/[roomId]` page
 * recover the `sessionId` the workflow transport and `chat_messages`
 * history read require (recoupable/chat#1747).
 *
 * Returns `null` when the chat doesn't exist or the caller can't access
 * it (404/403) — e.g. a legacy room whose account was deleted, or one
 * the Phase 2 backfill skipped — so the caller can render a "not found"
 * state instead of an error. Throws on other failures (e.g. 5xx) so
 * transient problems aren't silently swallowed.
 *
 * @param chatId - The chat (room) id from the URL.
 * @param recoupAccessToken - Short-lived Privy JWT for `Authorization`.
 */
export async function getChat(
  chatId: string,
  recoupAccessToken: string | null,
): Promise<ApiChat | null> {
  const headers: Record<string, string> = {};
  if (recoupAccessToken) {
    headers.Authorization = `Bearer ${recoupAccessToken}`;
  }

  const response = await fetch(
    `${getClientApiBaseUrl()}/api/chats/${encodeURIComponent(chatId)}`,
    { headers },
  );

  if (response.status === 404 || response.status === 403) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to load chat (${response.status})`);
  }

  const { chat } = (await response.json()) as GetChatResponse;
  return chat;
}
