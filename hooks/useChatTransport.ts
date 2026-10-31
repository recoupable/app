import { useMemo, useCallback, useRef, useLayoutEffect } from "react";
import type { UIMessage } from "ai";
import { createChatRequestLifecycle } from "@/lib/chat/createChatRequestLifecycle";
import { createSnapshotConsumer } from "@/lib/intelligent-ui/chat/createSnapshotConsumer";
import type { SnapshotHostScope } from "@/lib/intelligent-ui/chat/getSnapshotScopeKey";
import { isChatIntelligentUIEnabled } from "@/lib/intelligent-ui/chat/isChatIntelligentUIEnabled";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import { usePrivy } from "@privy-io/react-auth";
import { createWorkflowChatTransport } from "@/lib/chat/createWorkflowChatTransport";
import { waitForWorkspace } from "@/lib/chat/waitForWorkspace";
import type { WorkspaceStatus } from "@/components/VercelChat/WorkspaceStatusIndicator";
import type { CatalogSurfaceRequest } from "@/lib/intelligent-ui/chat/getChatCatalogHost";

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
  snapshotScope?: SnapshotHostScope;
  devCatalogSurface?: CatalogSurfaceRequest;
  getMessages?: () => UIMessage[];
  requestScope?: string;
  onStreamEnd?: () => unknown;
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
  snapshotScope,
  devCatalogSurface,
  getMessages,
  requestScope,
  onStreamEnd,
}: UseChatTransportOptions) {
  const { getAccessToken } = usePrivy();
  const requestLifecycle = useMemo(() => createChatRequestLifecycle(), []);
  useLayoutEffect(
    () => () => requestLifecycle.cancelAll(),
    [requestLifecycle, requestScope],
  );
  const baseUrl = getClientApiBaseUrl();

  // Read the latest ids at request time via refs. `useChat` captures the
  // transport from the mount render and does not swap it when `chatId` /
  // `sessionId` change — so a new chat that mounts during provisioning
  // (sessionId still undefined, chatId a placeholder) would otherwise POST
  // those stale values on first send. Refs keep the transport instance
  // stable while always sending the ids current as of the request.
  // Only committed renders may change the identity seen by active callbacks.
  // A prospective render can suspend and be discarded while the previous
  // scope's response remains visible and continues streaming.
  const live = useRef({
    chatId,
    sessionId,
    workspaceStatus,
    snapshotScope,
    devCatalogSurface,
    getMessages,
    getAccessToken,
    onStreamEnd,
  });
  const snapshotConsumer = useMemo(
    () => createSnapshotConsumer(() => live.current.snapshotScope),
    [],
  );
  const scopeKey = snapshotConsumer.getBindingKey(snapshotScope);
  useLayoutEffect(() => {
    snapshotConsumer.activate();
    return () => snapshotConsumer.dispose();
  }, [snapshotConsumer]);
  useLayoutEffect(() => {
    live.current = {
      chatId,
      sessionId,
      workspaceStatus,
      snapshotScope,
      devCatalogSurface,
      getMessages,
      getAccessToken,
      onStreamEnd,
    };
    snapshotConsumer.syncScope();
  });
  const intelligentUI = useMemo(
    () => (scopeKey ? { consumer: snapshotConsumer, scopeKey } : undefined),
    [scopeKey, snapshotConsumer],
  );

  const getHeaders = useCallback(async () => {
    const accessToken = await live.current.getAccessToken();
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
  }, []);

  const transport = useMemo(
    () =>
      createWorkflowChatTransport({
        baseUrl,
        requestLifecycle,
        captureStreamEnd: () => live.current.onStreamEnd,
        getIds: () => ({
          sessionId: live.current.sessionId,
          chatId: live.current.chatId,
        }),
        getAccessToken: () => live.current.getAccessToken(),
        waitForWorkspace: () =>
          waitForWorkspace(() => live.current.workspaceStatus),
        snapshotConsumer: isChatIntelligentUIEnabled()
          ? snapshotConsumer
          : undefined,
        getMessages: () => live.current.getMessages?.() ?? [],
        getDevCatalogSurface: () =>
          isChatIntelligentUIEnabled()
            ? live.current.devCatalogSurface
            : undefined,
      }),
    [baseUrl, snapshotConsumer, requestLifecycle],
  );

  return {
    transport,
    getHeaders,
    intelligentUI,
    snapshotConsumer,
    requestLifecycle,
  };
}
