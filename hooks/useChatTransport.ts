import { useMemo, useCallback } from "react";
import { DefaultChatTransport } from "ai";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import { usePrivy } from "@privy-io/react-auth";

interface UseChatTransportOptions {
  /** Chat row id (also the AI SDK `useChat({ id })` instance id). */
  chatId: string;
  /**
   * Session id from `createSession`. When provided, the transport
   * targets recoup-api's `POST /api/chat/workflow` (the workflow path
   * cutover tracked in recoupable/chat#1747) and injects
   * `sessionId` + `chatId` + `recoupAccessToken` at the transport
   * boundary.
   *
   * When absent, the transport targets the legacy `POST /api/chat`
   * route — used by `/chat/[roomId]` pages opened from history that
   * don't have a `session_id` on their chat row yet. Those rows will
   * be backfilled in Phase 2 (recoupable/chat#1747), at which point
   * this branch can be deleted.
   */
  sessionId?: string;
}

/**
 * Chat transport for chat.recoupable.com. Branches on `sessionId`:
 *   - **workflow path** (sessionId present) → recoup-api
 *     `/api/chat/workflow`, with `sessionId` + `chatId` +
 *     `recoupAccessToken` injected so per-`sendMessage` callers don't
 *     need to know the workflow body shape.
 *   - **legacy path** (no sessionId) → `/api/chat` on the same base,
 *     same behavior chat.recoupable.com had before the workflow
 *     cutover. Per-call body from `useVercelChat`'s
 *     `sendMessage(payload, { body })` (`roomId`, `artistId`, `model`,
 *     …) flows through unchanged.
 *
 * Both branches return the Privy JWT in the `Authorization: Bearer`
 * header via `getHeaders`; the workflow branch also adds it
 * transport-side so recoup-api's `validateAuthContext` accepts the
 * cross-origin POST.
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

  const transport = useMemo(() => {
    if (!sessionId) {
      return new DefaultChatTransport({
        api: `${baseUrl}/api/chat`,
      });
    }

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
      // Resume/reconnect targets recoup-api's dedicated GET stream route
      // (POST /api/chat/workflow never resumes). The transport `headers`
      // above carry the Privy bearer on this request too.
      prepareReconnectToStreamRequest: ({ id }) => ({
        api: `${baseUrl}/api/chat/${encodeURIComponent(id)}/stream`,
      }),
    });
  }, [baseUrl, chatId, sessionId, getAccessToken]);

  return { transport, getHeaders };
}
