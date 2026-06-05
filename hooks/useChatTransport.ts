import { useMemo, useCallback, useRef } from "react";
import { DefaultChatTransport } from "ai";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import { usePrivy } from "@privy-io/react-auth";

interface UseChatTransportOptions {
  /** Chat row id (also the AI SDK `useChat({ id })` instance id). */
  chatId: string;
  /**
   * Session id from bootstrap or canonical route. Absent only while a new
   * chat is still provisioning; Send is gated until it lands, so the
   * transport is never invoked without it.
   */
  sessionId?: string;
}

/**
 * Chat transport for chat.recoupable.com → recoup-api
 * `POST /api/chat`. Injects `sessionId`, `chatId`, and
 * `recoupAccessToken` at the transport boundary so callers only pass
 * per-message fields (model, etc.) via `sendMessage`.
 */
export function useChatTransport({
  chatId,
  sessionId,
}: UseChatTransportOptions) {
  const { getAccessToken } = usePrivy();
  const baseUrl = getClientApiBaseUrl();

  // Read the latest ids at request time via refs. `useChat` captures the
  // transport from the mount render and does not swap it when `chatId` /
  // `sessionId` change — so a new chat that mounts during provisioning
  // (sessionId still undefined, chatId a placeholder) would otherwise POST
  // those stale values on first send. Refs keep the transport instance
  // stable while always sending the ids current as of the request.
  const chatIdRef = useRef(chatId);
  const sessionIdRef = useRef(sessionId);
  chatIdRef.current = chatId;
  sessionIdRef.current = sessionId;

  const getHeaders = useCallback(async () => {
    const accessToken = await getAccessToken();
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
  }, [getAccessToken]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `${baseUrl}/api/chat`,
        headers: async (): Promise<Record<string, string>> => {
          const accessToken = await getAccessToken().catch(() => null);
          return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
        },
        body: async () => {
          const recoupAccessToken = await getAccessToken().catch(() => null);
          const body: {
            sessionId: string | undefined;
            chatId: string;
            recoupAccessToken?: string;
          } = { sessionId: sessionIdRef.current, chatId: chatIdRef.current };
          if (recoupAccessToken) body.recoupAccessToken = recoupAccessToken;
          return body;
        },
      }),
    [baseUrl, getAccessToken],
  );

  return { transport, getHeaders };
}
