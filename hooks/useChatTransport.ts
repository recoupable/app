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
  // Highest chunk index the server has reported serving us, from the
  // `x-workflow-stream-tail-index` response header. Drives `startIndex` on
  // reconnect so a resume is gap-free rather than a replay.
  const tailIndexRef = useRef<number | null>(null);
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
        // Capture `x-workflow-stream-tail-index` off every response. The
        // resume route reports where the read it just served ends, which is
        // the only honest value to send as `startIndex` on the next
        // reconnect — without it a reconnect replays the turn from chunk zero
        // and the client re-renders content it already has.
        fetch: (async (input, init) => {
          const response = await globalThis.fetch(input as RequestInfo, init);
          const tail = response.headers.get("x-workflow-stream-tail-index");
          if (tail !== null) {
            const parsed = Number(tail);
            if (Number.isInteger(parsed) && parsed >= 0) tailIndexRef.current = parsed;
          }
          return response;
        }) as typeof globalThis.fetch,
        // Reconnect hits `GET {api}/{chatId}/stream` — recoup-api's resume
        // route, which is authenticated like every other endpoint. Without
        // this the reconnect 401s and a dropped stream stays dropped.
        prepareReconnectToStreamRequest: async ({ api }) => {
          const accessToken = await getAccessToken().catch(() => null);
          const headers: Record<string, string> = {};
          if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

          // Resume from the chunk after the last one we saw. The route reports
          // a 0-based tail index, so the next unseen chunk is tail + 1.
          const tail = tailIndexRef.current;
          const url = tail === null ? api : `${api}?startIndex=${tail + 1}`;

          return { headers, api: url };
        },
      }),
    [baseUrl, getAccessToken],
  );

  return { transport, getHeaders };
}
