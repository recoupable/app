import { useMemo, useCallback } from "react";
import { DefaultChatTransport } from "ai";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import { usePrivy } from "@privy-io/react-auth";

interface UseChatTransportOptions {
  /** Chat row id (also the AI SDK `useChat({ id })` instance id). */
  chatId: string;
  /** Session id from bootstrap or canonical route — required for workflow transport. */
  sessionId: string;
}

/**
 * Chat transport for chat.recoupable.com → recoup-api
 * `POST /api/chat/workflow`. Injects `sessionId`, `chatId`, and
 * `recoupAccessToken` at the transport boundary so callers only pass
 * per-message fields (model, etc.) via `sendMessage`.
 */
export function useChatTransport({
  chatId,
  sessionId,
}: UseChatTransportOptions) {
  const { getAccessToken } = usePrivy();
  const baseUrl = getClientApiBaseUrl();

  const getHeaders = useCallback(async () => {
    const accessToken = await getAccessToken();
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
  }, [getAccessToken]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
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
      }),
    [baseUrl, chatId, sessionId, getAccessToken],
  );

  return { transport, getHeaders };
}
