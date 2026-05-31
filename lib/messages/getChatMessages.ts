import { UIMessage } from "ai";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

/**
 * Fetch the persisted UI message stream for a session-scoped chat from
 * recoup-api `GET /api/sessions/{sessionId}/chats/{chatId}`. Each row's
 * `parts` blob is the full UIMessage, so the response can be handed
 * straight to the Vercel AI SDK as initial messages.
 */
export async function getChatMessages(
  sessionId: string,
  chatId: string,
  accessToken: string,
): Promise<UIMessage[]> {
  const response = await fetch(
    `${getClientApiBaseUrl()}/api/sessions/${encodeURIComponent(sessionId)}/chats/${encodeURIComponent(chatId)}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!response.ok) return [];

  const data = (await response.json()) as { messages?: UIMessage[] };
  return data.messages ?? [];
}
