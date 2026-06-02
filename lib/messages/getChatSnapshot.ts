import { UIMessage } from "ai";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

export interface ChatSnapshot {
  /** Persisted UI messages; each row's `parts` blob is a full UIMessage. */
  messages: UIMessage[];
  /** True when a workflow run is still in flight and can be resumed. */
  isStreaming: boolean;
}

/**
 * Fetch a session-scoped chat snapshot from recoup-api
 * `GET /api/sessions/{sessionId}/chats/{chatId}`: the persisted messages
 * plus whether a workflow run is still streaming (so the caller can
 * reconnect via `GET /api/chat/{chatId}/stream`).
 */
export async function getChatSnapshot(
  sessionId: string,
  chatId: string,
  accessToken: string,
): Promise<ChatSnapshot> {
  const response = await fetch(
    `${getClientApiBaseUrl()}/api/sessions/${encodeURIComponent(sessionId)}/chats/${encodeURIComponent(chatId)}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!response.ok) return { messages: [], isStreaming: false };

  const data = (await response.json()) as {
    messages?: UIMessage[];
    isStreaming?: boolean;
  };

  return {
    messages: data.messages ?? [],
    isStreaming: data.isStreaming ?? false,
  };
}
