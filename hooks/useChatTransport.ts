import { useMemo, useCallback } from "react";
import { DefaultChatTransport } from "ai";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import { usePrivy } from "@privy-io/react-auth";

interface UseChatTransportOptions {
  /** Chat row id (also the AI SDK `useChat({ id })` instance id). */
  chatId: string;
  /**
   * Session id for the chat. Required: the transport targets recoup-api's
   * `POST /api/chat/workflow` and injects `sessionId` + `chatId` +
   * `recoupAccessToken` at the transport boundary. New chats get the
   * `sessionId` from the bootstrap; existing chats resolve it from the
   * chat row (recoupable/chat#1747).
   */
  sessionId: string;
}

/**
 * Chat transport for chat.recoupable.com. Targets recoup-api's
 * `/api/chat/workflow` with `sessionId` + `chatId` + `recoupAccessToken`
 * injected so per-`sendMessage` callers don't need to know the workflow
 * body shape. The Privy JWT is returned both via `getHeaders` (for
 * per-call use) and transport-side so recoup-api's `validateAuthContext`
 * accepts the cross-origin POST.
 */
export function useChatTransport({ chatId, sessionId }: UseChatTransportOptions) {
  const { getAccessToken } = usePrivy();
  const baseUrl = getClientApiBaseUrl();

  const getHeaders = useCallback(async () => {
    const accessToken = await getAccessToken();
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
  }, [getAccessToken]);

  const transport = useMemo(() => {
    return new DefaultChatTransport({
      api: `${baseUrl}/api/chat/workflow`,
      headers: async (): Promise<Record<string, string>> => {
        const accessToken = await getAccessToken().catch(() => null);
        return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
      },
      body: async () => {
        const recoupAccessToken = await getAccessToken().catch(() => null);
        const body: {
          sessionId: string;
          chatId: string;
          recoupAccessToken?: string;
        } = { sessionId, chatId };
        if (recoupAccessToken) body.recoupAccessToken = recoupAccessToken;
        return body;
      },
    });
  }, [baseUrl, chatId, sessionId, getAccessToken]);

  return { transport, getHeaders };
}
