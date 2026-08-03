import { useMemo, useCallback, useRef } from "react";
import { DefaultChatTransport } from "ai";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import { usePrivy } from "@privy-io/react-auth";
import { createChunkCountingFetch } from "@/lib/chat/createChunkCountingFetch";
import { buildStreamReconnectUrl } from "@/lib/chat/buildStreamReconnectUrl";

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
  // Flipped when the resume route answers 204. Read by the recovery hook to
  // stop probing a turn the server says is over.
  const noActiveStreamRef = useRef(false);
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
  // Absolute index of the last stream chunk this client received, maintained
  // by `createChunkCountingFetch`. Drives `startIndex` on reconnect.
  const lastChunkIndexRef = useRef<number | null>(null);
  // Switching chats voids the position: the transport is memoised for the
  // lifetime of the hook, so without this a reconnect for the new chat could
  // resume at an index belonging to the old one.
  if (chatIdRef.current !== chatId) lastChunkIndexRef.current = null;
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
        fetch: createChunkCountingFetch({
          baseUrl,
          onPosition: (index) => {
            lastChunkIndexRef.current = index;
          },
        }),
        // Reconnect hits recoup-api's resume route, which is authenticated
        // like every other endpoint. Without this the reconnect 401s and a
        // dropped stream stays dropped.
        prepareReconnectToStreamRequest: async ({ api }) => {
          const accessToken = await getAccessToken().catch(() => null);
          const headers: Record<string, string> = {};
          if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

          return {
            headers,
            api: buildStreamReconnectUrl(
              api,
              chatIdRef.current,
              lastChunkIndexRef.current,
            ),
          };
        },
      }),
    [baseUrl, getAccessToken],
  );

  return { transport, getHeaders, noActiveStreamRef };
}
