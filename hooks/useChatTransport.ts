import { useMemo, useCallback, useRef } from "react";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import { usePrivy } from "@privy-io/react-auth";
import { createWorkflowChatTransport } from "@/lib/chat/createWorkflowChatTransport";
import { waitForWorkspace } from "@/lib/chat/waitForWorkspace";
import type { WorkspaceStatus } from "@/components/VercelChat/WorkspaceStatusIndicator";

interface UseChatTransportOptions {
  /** Chat row id (also the AI SDK `useChat({ id })` instance id). */
  chatId: string;
  /**
   * Session id from bootstrap or canonical route. Absent only while a new
   * chat is still provisioning; the request waits on `workspaceStatus`
   * before reading it.
   */
  sessionId?: string;
  /** Workspace lifecycle; a request holds until `ready` (app#2052). */
  workspaceStatus?: WorkspaceStatus;
}

/**
 * Chat transport for chat.recoupable.dev → recoup-api `POST /api/chat`.
 *
 * Injects `sessionId`, `chatId` and `recoupAccessToken` at the transport
 * boundary so callers only pass per-message fields (model, etc.) via
 * `sendMessage`. Reconnection through a dropped stream is the transport's own
 * job — see `createWorkflowChatTransport`.
 */
export function useChatTransport({
  chatId,
  sessionId,
  workspaceStatus = "ready",
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
  const workspaceStatusRef = useRef(workspaceStatus);
  chatIdRef.current = chatId;
  sessionIdRef.current = sessionId;
  workspaceStatusRef.current = workspaceStatus;

  const getHeaders = useCallback(async () => {
    const accessToken = await getAccessToken();
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
  }, [getAccessToken]);

  const transport = useMemo(
    () =>
      createWorkflowChatTransport({
        baseUrl,
        getIds: () => ({
          sessionId: sessionIdRef.current,
          chatId: chatIdRef.current,
        }),
        getAccessToken,
        waitForWorkspace: () =>
          waitForWorkspace(() => workspaceStatusRef.current),
      }),
    [baseUrl, getAccessToken],
  );

  return { transport, getHeaders };
}
