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
  // Absolute index of the last stream chunk this client has actually received.
  // Drives `startIndex` on reconnect so a resume is gap-free rather than a
  // replay. Counted from the wire, NOT taken from
  // `x-workflow-stream-tail-index`: that header reports the tail at the moment
  // the read was opened, so a read that stays open past it under-reports (a
  // live read returning 22 chunks advertised a tail of 9). The header is only
  // a base for the read's starting position; what we have actually consumed is
  // that base plus the chunks counted off the body.
  const lastChunkIndexRef = useRef<number | null>(null);
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
        // Track how far through the stream this client actually got, by
        // counting SSE frames off a tee of the body. `startIndex` on the next
        // reconnect is that position + 1, so a resume neither replays chunks
        // we have rendered nor skips ones we have not.
        fetch: (async (input, init) => {
          const response = await globalThis.fetch(input as RequestInfo, init);
          if (!response.body) return response;

          const url = typeof input === "string" ? input : (input as Request).url;
          const requested = Number(new URL(url, baseUrl).searchParams.get("startIndex") ?? "0");
          let index = (Number.isInteger(requested) && requested >= 0 ? requested : 0) - 1;

          const [toCaller, toCount] = response.body.tee();
          void (async () => {
            const reader = toCount.getReader();
            const decoder = new TextDecoder();
            let buffered = "";
            try {
              for (;;) {
                const { done, value } = await reader.read();
                if (done) break;
                buffered += decoder.decode(value, { stream: true });
                const lines = buffered.split("\n");
                buffered = lines.pop() ?? "";
                for (const line of lines) {
                  // `[DONE]` is the SSE terminator, not a stream chunk.
                  if (line.startsWith("data: ") && !line.startsWith("data: [DONE]")) {
                    index += 1;
                    lastChunkIndexRef.current = index;
                  }
                }
              }
            } catch {
              // Counting is best-effort; a torn read just means the next
              // reconnect resumes from the last index we did count.
            } finally {
              reader.releaseLock();
            }
          })();

          return new Response(toCaller, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
          });
        }) as typeof globalThis.fetch,
        // Reconnect hits `GET {api}/{chatId}/stream` — recoup-api's resume
        // route, which is authenticated like every other endpoint. Without
        // this the reconnect 401s and a dropped stream stays dropped.
        prepareReconnectToStreamRequest: async ({ api }) => {
          const accessToken = await getAccessToken().catch(() => null);
          const headers: Record<string, string> = {};
          if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

          // Resume from the chunk after the last one we actually received.
          const last = lastChunkIndexRef.current;
          const url = last === null ? api : `${api}?startIndex=${last + 1}`;

          return { headers, api: url };
        },
      }),
    [baseUrl, getAccessToken],
  );

  return { transport, getHeaders };
}
