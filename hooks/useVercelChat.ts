import { getChatSendErrorMessage } from "@/lib/chat/getChatSendErrorMessage";
import { getChatStopErrorMessage } from "@/lib/chat/getChatStopErrorMessage";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import type { ChatAdmissionMetadata } from "@/lib/chat/createChatRequestLifecycle";
import type { CatalogQueryInput } from "@/lib/intelligent-ui/chat/getChatCatalogHost";
import { createChatSubmissionGuard } from "@/lib/chat/createChatSubmissionGuard";
import { useChat } from "@ai-sdk/react";
import { useMessageLoader } from "./useMessageLoader";
import { useUserProvider } from "@/providers/UserProvder";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { useOrganization } from "@/providers/OrganizationProvider";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import {
  useEffect,
  useLayoutEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import getEarliestFailedUserMessageId from "@/lib/messages/getEarliestFailedUserMessageId";
import { generateUUID } from "@/lib/generateUUID";
import { useConversationsProvider } from "@/providers/ConversationsProvider";
import { UIMessage, FileUIPart } from "ai";
import useAvailableModels from "./useAvailableModels";
import { useLocalStorage } from "usehooks-ts";
import { useAccountOverride } from "@/providers/AccountOverrideProvider";
import { usePaymentProvider } from "@/providers/PaymentProvider";
import useArtistFilesForMentions from "@/hooks/useArtistFilesForMentions";
import { useChatTransport } from "./useChatTransport";
import { usePrivy } from "@privy-io/react-auth";
import { useSandboxAccountScope } from "./useSandboxAccountScope";
import { TextAttachment } from "@/types/textAttachment";
import { formatTextAttachments } from "@/lib/chat/formatTextAttachments";
import { useDeleteTrailingMessages } from "./useDeleteTrailingMessages";
import { getFileContents } from "@/lib/sandboxes/getFileContents";
import getMimeFromPath from "@/lib/files/getMimeFromPath";
import { getChatPath } from "@/lib/chat/getChatPath";
import { useInitialMessageAutoSend } from "./useInitialMessageAutoSend";
import { usePersistSelectedModel } from "./usePersistSelectedModel";
import shouldResumeStream from "@/lib/chat/shouldResumeStream";
import type { WorkspaceStatus } from "@/components/VercelChat/WorkspaceStatusIndicator";
import { isChatIntelligentUIEnabled } from "@/lib/intelligent-ui/chat/isChatIntelligentUIEnabled";
import { getChatCatalogHost } from "@/lib/intelligent-ui/chat/getChatCatalogHost";
import type { SnapshotHostScope } from "@/lib/intelligent-ui/chat/getSnapshotScopeKey";

interface UseVercelChatProps {
  id: string;
  catalogId?: string | string[];
  catalogQuery?: CatalogQueryInput;
  /**
   * Session id from `/sessions/[sessionId]/chats/[chatId]` (always
   * present) or the new-chat bootstrap (absent until provisioning
   * resolves; the transport holds the request until it lands).
   */
  sessionId?: string;
  /**
   * Api-minted chat id from bootstrap when `id` is a client placeholder.
   * Used as the transport / message-load / URL target; falls back to `id`.
   */
  workflowChatId?: string;
  isNewChatBootstrap?: boolean;
  /** Workspace lifecycle; the transport holds a send until `ready`. */
  workspaceStatus?: WorkspaceStatus;
  initialMessages?: UIMessage[];
  attachments?: FileUIPart[];
  textAttachments?: TextAttachment[];
  onDraftAccepted?: () => void;
}

interface SubmittedChatDraft {
  message?: UIMessage;
  regenerate?: boolean;
  input: string;
  revision: number;
  attachments: FileUIPart[];
  textAttachments: TextAttachment[];
  mentionAttachments: FileUIPart[];
  mentionTextContext: string;
  onAccepted?: () => void;
}

/**
 * A hook that provides all chat functionality for the Vercel Chat component
 * Combines useChat, and useMessageLoader
 * Accesses user and artist data directly from providers
 */
export function useVercelChat({
  id,
  catalogId,
  catalogQuery,
  sessionId,
  workflowChatId,
  isNewChatBootstrap = false,
  workspaceStatus,
  initialMessages,
  attachments = [],
  textAttachments = [],
  onDraftAccepted,
}: UseVercelChatProps) {
  const submitOnce = useMemo(() => createChatSubmissionGuard(), []);
  const { userData } = useUserProvider();
  const { selectedArtist } = useArtistProvider();
  const { selectedOrgId: organizationId, isInitialized } = useOrganization();
  const { chatId } = useParams<{ chatId?: string }>();

  const userId = userData?.account_id || userData?.id; // Use account_id if available, fallback to id
  const { accountIdOverride } = useAccountOverride();
  const {
    scopeKey: fileScopeKey,
    apiBaseUrl: fileApiBaseUrl,
    ready: fileScopeReady,
    isCurrent: isFileScopeCurrent,
  } = useSandboxAccountScope();
  const effectiveAccountId = fileScopeReady
    ? (accountIdOverride ?? userId)
    : undefined;
  const catalogHost = getChatCatalogHost({
    catalogId,
    catalogQuery,
    workspaceInitialized: isInitialized,
    organizationId,
    accountId: effectiveAccountId,
  });
  // An explicit malformed catalog must not silently become artist context.
  const artistId =
    catalogHost.kind === "absent" ? selectedArtist?.account_id : undefined;
  const { authenticated, getAccessToken, user: authenticatedUser } = usePrivy();
  const messagesRef = useRef<UIMessage[]>([]);
  const historyScopeRef = useRef("");
  const supersededHistoryScopeRef = useRef<string | undefined>(undefined);
  const { addOptimisticConversation } = useConversationsProvider();
  const { data: availableModels = [] } = useAvailableModels();
  const [{ value: input, revision: renderInputRevision }, updateInput] =
    useState({ value: "", revision: 0 });
  const inputRevision = useRef(0);
  const [sendError, setSendError] = useState<string>();
  const [sendErrorStatus, setSendErrorStatus] = useState<number>();
  const [failedDraft, updateFailedDraft] = useState<SubmittedChatDraft>();
  const failedDraftRef = useRef<SubmittedChatDraft | undefined>(undefined);
  const setFailedDraft = useCallback(
    (draft?: SubmittedChatDraft) => {
      failedDraftRef.current = draft;
      updateFailedDraft(draft);
    },
    [updateFailedDraft],
  );
  const [preparing, setPreparing] = useState(false);
  const [initialAutoSendCancelled, setInitialAutoSendCancelled] =
    useState(false);
  const [stopState, setStopState] = useState<{
    status: "idle" | "stopping" | "stopped" | "inactive" | "error";
    message?: string;
    httpStatus?: number;
  }>({ status: "idle" });
  const intentEpoch = useRef(0);
  const committedScope = useRef("");
  const scopeGeneration = useRef(0);
  const committedIds = useRef({ sessionId, workflowChatId });
  const actionGenerations = useRef(new Map<object, number>());
  const mounted = useRef(false);
  const attemptRef = useRef<object | undefined>(undefined);
  const stoppingRef = useRef<Promise<void> | undefined>(undefined);
  const stopBlockedRef = useRef(false);
  const unacceptedIds = useRef(new Set<string>());
  const pendingAdmissionIds = useRef(new Set<string>());
  // Start existing browsers on Auto too; the legacy key stores a fixed model
  // from the removed composer picker and would otherwise bypass routing.
  const [model, setModel] = useLocalStorage("RECOUP_CHAT_MODEL_V2", "auto");
  const { refetchCredits } = usePaymentProvider();
  // The api-minted chat id once bootstrap resolves; before then `id` is a
  // client placeholder. Drives the transport, message load, and URL so
  // sends/persistence target the row recoup-api actually created.
  const transportChatId = workflowChatId ?? id;
  const hostWorkspace =
    catalogHost.kind === "catalog"
      ? catalogHost.workspace
      : catalogHost.kind === "absent" && organizationId
        ? { kind: "organization" as const, id: organizationId }
        : undefined;
  const hostSubject =
    catalogHost.kind === "catalog"
      ? catalogHost.subject
      : artistId
        ? { kind: "artist", id: artistId }
        : undefined;
  const snapshotScope: SnapshotHostScope | undefined =
    authenticated &&
    authenticatedUser?.id &&
    userId &&
    effectiveAccountId &&
    (hostWorkspace || catalogHost.kind === "catalog") &&
    hostSubject
      ? {
          actorId: authenticatedUser.id,
          accountId: effectiveAccountId,
          workspaceId: hostWorkspace?.id ?? "",
          ...(catalogHost.kind === "catalog" && {
            workspaceKind: hostWorkspace?.kind ?? "uninitialized",
            queryKey: catalogHost.queryKey,
          }),
          sessionId:
            catalogHost.kind === "catalog" && !catalogHost.query
              ? ""
              : (sessionId ?? ""),
          chatId: transportChatId,
          subject: hostSubject,
        }
      : undefined;
  const requestScope = JSON.stringify([
    authenticated,
    id,
    isNewChatBootstrap,
    authenticatedUser?.id,
    effectiveAccountId,
    fileScopeKey,
    fileApiBaseUrl,
    fileScopeReady,
    organizationId,
    artistId,
    catalogHost.kind === "catalog"
      ? [
          catalogHost.subject.id,
          catalogHost.queryKey,
          catalogHost.workspace?.kind,
          catalogHost.workspace?.id,
        ]
      : catalogHost.kind,
  ]);
  useLayoutEffect(() => {
    mounted.current = true;
    committedScope.current = requestScope;
    intentEpoch.current++;
    scopeGeneration.current++;
    actionGenerations.current.clear();
    attemptRef.current = undefined;
    unacceptedIds.current.clear();
    pendingAdmissionIds.current.clear();
    stoppingRef.current = undefined;
    stopBlockedRef.current = false;
    // Scope-owned recovery resets only after commit; a suspended render must
    // retain the current draft and server Stop state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreparing(false);
    setInitialAutoSendCancelled(false);
    setSendError(undefined);
    setSendErrorStatus(undefined);
    setFailedDraft(undefined);
    setStopState({ status: "idle" });
    return () => {
      mounted.current = false;
    };
  }, [requestScope, setFailedDraft]);
  const {
    transport,
    getHeaders,
    intelligentUI,
    snapshotConsumer,
    requestLifecycle,
  } = useChatTransport({
    chatId: transportChatId,
    sessionId,
    workspaceStatus,
    requestScope,
    onStreamEnd: refetchCredits,
    snapshotScope,
    devCatalogSurface:
      snapshotScope?.sessionId &&
      catalogHost.kind === "catalog" &&
      catalogHost.workspace &&
      catalogHost.query
        ? {
            workspaceId: catalogHost.workspace.id,
            query: catalogHost.query,
          }
        : undefined,
    getMessages: () => messagesRef.current,
  });
  useLayoutEffect(() => {
    const previous = committedIds.current;
    committedIds.current = { sessionId, workflowChatId };
    // Bootstrap is allowed to fill absent IDs. Changing an established
    // server identity is a different scope even if the client id is reused.
    if (
      (previous.sessionId && previous.sessionId !== sessionId) ||
      (previous.workflowChatId && previous.workflowChatId !== workflowChatId)
    ) {
      intentEpoch.current++;
      scopeGeneration.current++;
      actionGenerations.current.clear();
      requestLifecycle.cancelAll();
      attemptRef.current = undefined;
      stoppingRef.current = undefined;
      stopBlockedRef.current = false;
      unacceptedIds.current.clear();
      pendingAdmissionIds.current.clear();
      setPreparing(false);
      setSendError(undefined);
      setSendErrorStatus(undefined);
      setFailedDraft(undefined);
      setStopState({ status: "idle" });
    }
  }, [sessionId, workflowChatId, requestLifecycle, setFailedDraft]);
  // Each callback closes over a render-owned binding. Only its committed
  // generation may act; invoking an old closure cannot adopt the current host.
  const actionBinding = useMemo(
    () => ({ requestScope, sessionId, workflowChatId }),
    [requestScope, sessionId, workflowChatId],
  );
  useLayoutEffect(() => {
    actionGenerations.current.set(actionBinding, scopeGeneration.current);
  }, [actionBinding]);
  const isActionCurrent = useCallback(
    () =>
      mounted.current &&
      committedScope.current === requestScope &&
      actionGenerations.current.get(actionBinding) === scopeGeneration.current,
    [actionBinding, requestScope],
  );
  const setInput = useCallback(
    (value: string) => {
      if (!isActionCurrent()) return;
      inputRevision.current++;
      updateInput({ value, revision: inputRevision.current });
    },
    [isActionCurrent, updateInput],
  );
  const coordinateHistory = isChatIntelligentUIEnabled();
  const captureSendIntent = useCallback(() => {
    if (!isActionCurrent() || !fileScopeReady || !isFileScopeCurrent())
      return () => false;
    const epoch = intentEpoch.current;
    const snapshotCurrent = snapshotConsumer.captureSendIntent();
    return () =>
      isActionCurrent() &&
      isFileScopeCurrent() &&
      epoch === intentEpoch.current &&
      snapshotCurrent();
  }, [snapshotConsumer, isActionCurrent, fileScopeReady, isFileScopeCurrent]);
  const historyLoadScope = coordinateHistory
    ? JSON.stringify([
        authenticatedUser?.id,
        userId,
        accountIdOverride,
        organizationId,
        artistId,
        sessionId,
        transportChatId,
        intelligentUI?.scopeKey,
        ...(catalogHost.kind !== "absent"
          ? [catalogId, isInitialized, snapshotScope?.queryKey]
          : []),
      ])
    : "";
  useLayoutEffect(() => {
    historyScopeRef.current = historyLoadScope;
  }, [historyLoadScope]);
  const [historyReadiness, setHistoryReadiness] = useState<{
    scopeKey: string;
    state: "ready" | "cancelled";
  }>();
  const cancelPendingResume = useCallback(
    (supersedeHistory = false) => {
      if (!coordinateHistory) return;
      // Stop may still display saved history. A deliberate new send owns the
      // SDK state immediately, so its pending history must never replace it.
      if (supersedeHistory)
        supersededHistoryScopeRef.current = historyLoadScope;
      setHistoryReadiness({ scopeKey: historyLoadScope, state: "cancelled" });
    },
    [coordinateHistory, historyLoadScope],
  );

  // Persists the picker's selected model to chats.model_id; awaited before
  // send so the workflow bills the selected model (it reads chats.model_id
  // at request time), not the default.
  const persistSelectedModel = usePersistSelectedModel({
    sessionId,
    chatId: transportChatId,
    model,
    getAccessToken,
  });

  // Load artist files for mentions (from Supabase)
  const { files: allArtistFiles = [] } = useArtistFilesForMentions();

  // Extract mentioned file ids from input markup '@[display](id)'
  const selectedFileIds = useMemo(() => {
    const ids = new Set<string>();
    const regex = /@\[[^\]]+\]\(([^)]+)\)/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(input))) {
      if (match[1]) ids.add(match[1]);
    }
    return Array.from(ids);
  }, [input]);

  // Resolve selected sandbox files for mention context and file attachments.
  const [mentionAttachments, setMentionAttachments] = useState<FileUIPart[]>(
    [],
  );
  const [mentionTextContext, setMentionTextContext] = useState("");
  const [isLoadingSignedUrls, setIsLoadingSignedUrls] = useState(false);
  const mentionRequestScope = JSON.stringify([
    fileScopeKey,
    fileApiBaseUrl,
    fileScopeReady,
    selectedFileIds,
    allArtistFiles.map((file) => [file.id, file.path]),
  ]);
  const [resolvedMentionScope, setResolvedMentionScope] = useState<
    string | null
  >(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setResolvedMentionScope(null);
      if (!fileScopeReady || !isFileScopeCurrent()) return;
      if (!selectedFileIds.length) {
        if (!cancelled)
          setMentionAttachments((prev) => (prev.length ? [] : prev));
        if (!cancelled) setMentionTextContext((prev) => (prev ? "" : prev));
        if (!cancelled) setIsLoadingSignedUrls((prev) => (prev ? false : prev));
        return;
      }

      const idSet = new Set(selectedFileIds);
      const selected = allArtistFiles.filter((f) => idSet.has(f.id));
      // Never silently omit an unavailable file from the selected mentions.
      if (selected.length !== selectedFileIds.length) {
        if (!cancelled)
          setMentionAttachments((prev) => (prev.length ? [] : prev));
        if (!cancelled) setMentionTextContext((prev) => (prev ? "" : prev));
        if (!cancelled) setIsLoadingSignedUrls((prev) => (prev ? false : prev));
        return;
      }

      try {
        if (!cancelled) setIsLoadingSignedUrls(true);

        const accessToken = await getAccessToken();
        if (cancelled || !isFileScopeCurrent()) return;
        if (!accessToken) {
          throw new Error("Please sign in to attach mentioned files");
        }

        const results = await Promise.all(
          selected.map(async (f) => {
            const fileResult = await getFileContents(accessToken, f.path, {
              accountId: accountIdOverride,
            });
            const mimeType = f.mime_type || getMimeFromPath(f.path);
            return {
              path: f.path,
              mimeType,
              content: fileResult.content,
              dataUrl: fileResult.imageUrl,
            };
          }),
        );
        if (cancelled || !isFileScopeCurrent()) return;

        const nextAttachments: FileUIPart[] = [];
        const textBlocks: string[] = [];
        for (const result of results) {
          if (
            result.dataUrl &&
            (result.mimeType === "application/pdf" ||
              result.mimeType.startsWith("image/"))
          ) {
            nextAttachments.push({
              type: "file",
              url: result.dataUrl,
              mediaType: result.mimeType,
            });
            continue;
          }

          if (result.content) {
            textBlocks.push(
              `[Mentioned File: ${result.path}]\n${result.content}`,
            );
          }
        }

        if (!cancelled) setMentionAttachments(nextAttachments);
        if (!cancelled)
          setMentionTextContext(
            textBlocks.length ? textBlocks.join("\n\n") : "",
          );
        if (!cancelled) setIsLoadingSignedUrls(false);
        if (!cancelled) setResolvedMentionScope(mentionRequestScope);
      } catch (e) {
        console.error(e);
        if (!cancelled)
          setMentionAttachments((prev) => (prev.length ? [] : prev));
        if (!cancelled) setMentionTextContext((prev) => (prev ? "" : prev));
        if (!cancelled) setIsLoadingSignedUrls((prev) => (prev ? false : prev));
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [
    selectedFileIds,
    allArtistFiles,
    getAccessToken,
    accountIdOverride,
    fileScopeReady,
    isFileScopeCurrent,
    mentionRequestScope,
  ]);

  const chatRequestBody = useMemo(
    () => ({
      roomId: id,
      artistId,
      // Only include organizationId if it's not null (schema expects string | undefined)
      ...(organizationId && { organizationId }),
      ...(accountIdOverride && { accountId: accountIdOverride }),
      model,
    }),
    [id, artistId, organizationId, accountIdOverride, model],
  );

  const {
    messages,
    status,
    stop: stopChat,
    sendMessage,
    setMessages,
    regenerate,
  } = useChat({
    id,
    transport,
    // Re-attach to an in-progress response, so returning to a chat mid-turn
    // keeps rendering instead of showing a frozen half-message. Gated to an
    // authenticated visit to an existing chat — resuming unconditionally
    // 401s/404s on every cold load and surfaces as an error toast
    // (chat#1949 F4a).
    resume:
      fileScopeReady &&
      shouldResumeStream({ authenticated, routeChatId: chatId }) &&
      (!coordinateHistory ||
        (historyReadiness?.scopeKey === historyLoadScope &&
          historyReadiness.state === "ready")),
    experimental_throttle: 100,
    generateId: generateUUID,
    onError: (e) => {
      console.error("An error occurred, please try again!", e);
      toast.error("An error occurred, please try again!");
    },
  });
  const setScopedMessages = useCallback(
    (value: UIMessage[] | ((previous: UIMessage[]) => UIMessage[])) => {
      if (isActionCurrent()) setMessages(value);
    },
    [isActionCurrent, setMessages],
  );
  const setScopedModel = useCallback(
    (value: string) => {
      if (isActionCurrent()) setModel(value);
    },
    [isActionCurrent, setModel],
  );
  useLayoutEffect(() => {
    messagesRef.current = messages;
    if (intelligentUI)
      snapshotConsumer.observeMessages(messages, intelligentUI.scopeKey);
  }, [messages, intelligentUI, snapshotConsumer]);
  const stop = useCallback(() => {
    if (!isActionCurrent()) return Promise.resolve();
    if (stoppingRef.current) return stoppingRef.current;
    const capturedChatId = committedIds.current.workflowChatId ?? id;
    const dispatched = requestLifecycle.hasDispatchedRequest();
    const cancelledPreparationIds = dispatched
      ? undefined
      : new Set(pendingAdmissionIds.current);
    const cancelBootstrapPreparation =
      isNewChatBootstrap &&
      !committedIds.current.workflowChatId &&
      !committedIds.current.sessionId &&
      !dispatched &&
      !requestLifecycle.hasUnknownAdmission();
    const scope = committedScope.current;
    const generation = scopeGeneration.current;
    const isCurrent = () =>
      isActionCurrent() &&
      committedScope.current === scope &&
      scopeGeneration.current === generation;
    const capturedStopChat = stopChat;
    const tokenGetter = getAccessToken;
    intentEpoch.current++;
    setInitialAutoSendCancelled(true);
    stopBlockedRef.current = true;
    cancelPendingResume();
    requestLifecycle.cancelPreparation();
    if (cancelledPreparationIds?.size) {
      cancelledPreparationIds.forEach((messageId) =>
        pendingAdmissionIds.current.delete(messageId),
      );
      setMessages((previous) =>
        previous.filter((message) => !cancelledPreparationIds.has(message.id)),
      );
    }
    setPreparing(false);
    setStopState({ status: "stopping", message: "Stopping response…" });
    const operation = (async () => {
      let httpStatus: number | undefined;
      let reason: "auth" | "starting" | "message-unconfirmed" | undefined;
      try {
        if (cancelBootstrapPreparation) {
          // No routable chat ID has arrived yet. Cancel local preparation
          // rather than sending a placeholder or deferring Stop into a later chat.
          snapshotConsumer.cancel();
          await capturedStopChat();
          if (!isCurrent()) return;
          stopBlockedRef.current = false;
          setStopState({
            status: "inactive",
            message: "Message preparation cancelled. Your draft is still here.",
          });
          return;
        }
        // A legacy server may clear a pending slot before its POST starts the
        // run. Wait for dispatched admission before asking it to cancel.
        await requestLifecycle.waitForAdmission();
        if (!isCurrent()) return;
        const accessToken = await tokenGetter();
        if (!isCurrent()) return;
        if (!accessToken) {
          reason = "auth";
          throw new Error("Missing Stop access token");
        }
        const response = await fetch(
          `${getClientApiBaseUrl()}/api/chat/${encodeURIComponent(capturedChatId)}/stop`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );
        httpStatus = response.status;
        if (!response.ok) {
          if (httpStatus === 503) {
            const body: unknown = await response.json().catch(() => undefined);
            if (
              body &&
              typeof body === "object" &&
              "error" in body &&
              typeof body.error === "string" &&
              /still starting/i.test(body.error)
            )
              reason = "starting";
          }
          throw new Error(`Stop HTTP request failed (${httpStatus})`);
        }
        const result: unknown = await response.json().catch(() => {
          throw new Error("Could not confirm Stop. Retry Stop.");
        });
        if (
          !result ||
          typeof result !== "object" ||
          !("success" in result) ||
          result.success !== true ||
          !("stopped" in result) ||
          typeof result.stopped !== "boolean"
        )
          throw new Error("Could not confirm Stop. Retry Stop.");
        if (!isCurrent()) return;
        if (!result.stopped && requestLifecycle.hasUnknownAdmission()) {
          reason = "message-unconfirmed";
          throw new Error("Message admission remains unconfirmed after Stop");
        }
        if (result.stopped) requestLifecycle.confirmStopped();
        // The SDK's resumed GET does not receive its active-response signal.
        // Detach that captured reader only after the server outcome is known.
        requestLifecycle.detachReaders();
        snapshotConsumer.cancel();
        await capturedStopChat();
        if (!isCurrent()) return;
        stopBlockedRef.current = false;
        setStopState(
          result.stopped
            ? { status: "stopped", message: "Response stopped." }
            : {
                status: "inactive",
                message: "No active response was found when Stop was checked.",
              },
        );
      } catch {
        if (isCurrent())
          setStopState({
            status: "error",
            message: getChatStopErrorMessage({ httpStatus, reason }),
            httpStatus,
          });
      } finally {
        if (isCurrent()) stoppingRef.current = undefined;
      }
    })();
    stoppingRef.current = operation;
    return operation;
  }, [
    id,
    isNewChatBootstrap,
    isActionCurrent,
    cancelPendingResume,
    requestLifecycle,
    snapshotConsumer,
    stopChat,
    setMessages,
    getAccessToken,
    setPreparing,
    setStopState,
  ]);
  const historyScopeKey = intelligentUI?.scopeKey;
  const setHistoryMessages = useCallback(
    (loaded: UIMessage[]) => {
      if (!isActionCurrent()) return;
      if (
        coordinateHistory &&
        (historyScopeRef.current !== historyLoadScope ||
          supersededHistoryScopeRef.current === historyLoadScope)
      )
        return;
      const canonical = historyScopeKey
        ? snapshotConsumer.hydrate(loaded, historyScopeKey)
        : loaded;
      // Publish the canonical SDK state to the transport in this same turn;
      // the render/layout getter must not expose a preceding temporary message.
      if (coordinateHistory) messagesRef.current = canonical;
      setMessages(canonical);
    },
    [
      coordinateHistory,
      isActionCurrent,
      historyLoadScope,
      historyScopeKey,
      snapshotConsumer,
      setMessages,
    ],
  );
  const onHistoryLoaded = useCallback(() => {
    if (
      historyScopeRef.current !== historyLoadScope ||
      supersededHistoryScopeRef.current === historyLoadScope
    )
      return;
    setHistoryReadiness((previous) =>
      previous?.scopeKey === historyLoadScope && previous.state === "cancelled"
        ? previous
        : { scopeKey: historyLoadScope, state: "ready" },
    );
  }, [historyLoadScope]);

  // Reconnection through a dropped stream is the transport's job now — see
  // `createWorkflowChatTransport`. A long turn's stream ends at the ~120s
  // connection cap (chat#1928); the transport notices the missing `finish`
  // chunk and resumes from its own chunk count without a hook involved.

  const earliestFailedUserMessageId = useMemo(
    () => getEarliestFailedUserMessageId(messages),
    [messages],
  );

  const { deleteTrailingMessages } = useDeleteTrailingMessages({
    onSuccess: () => {
      setMessages((messages) => {
        const index = messages.findIndex(
          (m) => m.id === earliestFailedUserMessageId,
        );
        if (index !== -1) {
          return [...messages.slice(0, index)];
        }

        return messages;
      });
    },
  });

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    isCurrent: () => boolean,
    onDispatch: (ids: { chatId: string; sessionId?: string }) => void,
    draft: SubmittedChatDraft,
  ) => {
    e.preventDefault();
    cancelPendingResume(true);

    const headers = await getHeaders();
    if (!isCurrent()) return false;
    if (!headers?.Authorization)
      throw new Error("Please sign in to send this message");

    // Combine all attachments
    const combined: FileUIPart[] = [];
    if (draft.attachments.length > 0) combined.push(...draft.attachments);
    if (draft.mentionAttachments.length > 0)
      combined.push(...draft.mentionAttachments);

    // Separate audio files (can't be sent to AI as file parts)
    const audioAttachments = combined.filter((f) =>
      f.mediaType?.startsWith("audio/"),
    );
    const nonAudioAttachments = combined.filter(
      (f) => !f.mediaType?.startsWith("audio/"),
    );

    // Build message text with text file content and audio URLs prepended
    let messageText = draft.input;

    // Prepend text file content (markdown, CSV)
    const textContext = formatTextAttachments(draft.textAttachments);
    if (textContext) {
      messageText = textContext + "\n\n" + messageText;
    }

    // Prepend mentioned sandbox file text content.
    if (draft.mentionTextContext) {
      messageText = draft.mentionTextContext + "\n\n" + messageText;
    }

    // Prepend audio URLs
    if (audioAttachments.length > 0) {
      const audioContext = audioAttachments
        .map((a) => `[Audio: ${a.filename || "audio"}]\nURL: ${a.url}`)
        .join("\n\n");
      messageText = audioContext + "\n\n" + messageText;
    }

    const payload = {
      text: messageText,
      files: nonAudioAttachments.length > 0 ? nonAudioAttachments : undefined,
    };

    // Land the selected model in chats.model_id before the send fires.
    await persistSelectedModel(isCurrent);
    if (!isCurrent()) return false;

    const messageId = draft.message?.id ?? generateUUID();
    if (!draft.regenerate) {
      unacceptedIds.current.add(messageId);
      pendingAdmissionIds.current.add(messageId);
    }
    const scope = committedScope.current;
    const generation = scopeGeneration.current;
    const attempt = attemptRef.current;
    const canPublish = () =>
      mounted.current &&
      committedScope.current === scope &&
      scopeGeneration.current === generation &&
      attemptRef.current === attempt;
    let accepted = false;
    const metadata: ChatAdmissionMetadata = {
      isCurrent,
      onAccepted: (acceptedIds) => {
        accepted = true;
        if (!canPublish()) return;
        unacceptedIds.current.delete(messageId);
        pendingAdmissionIds.current.delete(messageId);
        if (inputRevision.current === draft.revision)
          updateInput({ value: "", revision: draft.revision });
        draft.onAccepted?.();
        setFailedDraft(undefined);
        setSendError(undefined);
        setSendErrorStatus(undefined);
        setPreparing(false);
        onDispatch(acceptedIds);
      },
      onRejected: (error) => {
        if (!canPublish()) return;
        pendingAdmissionIds.current.delete(messageId);
        if (error.name !== "AbortError") {
          setFailedDraft(draft);
          setSendError(getChatSendErrorMessage(error));
          setSendErrorStatus(error.status);
        }
        if (!draft.regenerate)
          setMessages((previous) =>
            previous.filter((message) => message.id !== messageId),
          );
      },
    };
    const request = { body: chatRequestBody, headers, metadata };
    if (draft.regenerate) await regenerate(request);
    else
      await sendMessage(
        draft.message ?? {
          id: messageId,
          role: "user",
          parts: [
            ...(payload.files ?? []),
            { type: "text", text: payload.text },
          ],
        },
        request,
      );
    return accepted;
  };

  const append = (message: UIMessage) => {
    void handleSendMessage(
      { preventDefault() {} } as React.FormEvent<HTMLFormElement>,
      {
        message,
        input: message.parts
          .filter((part) => part.type === "text")
          .map((part) => part.text)
          .join("\n"),
        revision: -1,
        attachments: message.parts.filter(
          (part): part is FileUIPart => part.type === "file",
        ),
        textAttachments: [],
        mentionAttachments: [],
        mentionTextContext: "",
      },
    );
  };

  const handleReload = async () => {
    const message =
      messages.findLast((message) => message.role === "user") ??
      messages.at(-1);
    if (!message) return;
    await handleSendMessage(
      { preventDefault() {} } as React.FormEvent<HTMLFormElement>,
      {
        message,
        regenerate: true,
        input: message.parts
          .filter((part) => part.type === "text")
          .map((part) => part.text)
          .join("\n"),
        revision: -1,
        attachments: [],
        textAttachments: [],
        mentionAttachments: [],
        mentionTextContext: "",
      },
    );
  };

  // Only load persisted history for an existing chat opened from a
  // canonical `/sessions/[sessionId]/chats/[chatId]` URL (route `chatId`
  // present). A new chat from the bootstrap has nothing to load, so we
  // skip the fetch — avoiding a spinner flashing over the input the user
  // is already typing into while provisioning resolves.
  const { isLoading: isMessagesLoading, hasError } = useMessageLoader(
    sessionId,
    fileScopeReady && chatId && (coordinateHistory || messages.length === 0)
      ? transportChatId
      : undefined,
    userId,
    setHistoryMessages,
    coordinateHistory ? onHistoryLoaded : undefined,
  );

  // Only show loading state when fetching persisted history for an existing chat.
  const isLoading = isMessagesLoading && !!id && messages.length === 0;

  const isGeneratingResponse =
    preparing ||
    stopState.status === "stopping" ||
    ["streaming", "submitted"].includes(status);

  const silentlyUpdateUrl = useCallback(() => {
    if (!sessionId) return;
    window.history.replaceState(
      {},
      "",
      getChatPath(sessionId, transportChatId, catalogId, catalogQuery),
    );
  }, [transportChatId, sessionId, catalogId, catalogQuery]);

  // On a cold start the ids land about a second after Send (app#2052), so
  // the URL update in handleSendMessage is a no-op then; this catches up.
  useEffect(() => {
    if (!chatId && messages.some((message) => message.role === "assistant"))
      silentlyUpdateUrl();
  }, [chatId, messages, silentlyUpdateUrl]);

  const handleSendMessage = async (
    event: React.FormEvent<HTMLFormElement>,
    retryDraft?: SubmittedChatDraft,
  ) => {
    event.preventDefault();
    if (!fileScopeReady || !isFileScopeCurrent()) {
      if (isActionCurrent())
        setSendError(
          "Wait for the selected account to resolve, or clear the account selection.",
        );
      return false;
    }
    if (
      !retryDraft &&
      selectedFileIds.length &&
      resolvedMentionScope !== mentionRequestScope
    ) {
      if (isActionCurrent())
        setSendError(
          "Mentioned files are not ready for this account. Wait for them to load, or remove the file mentions.",
        );
      return false;
    }
    if (
      (isGeneratingResponse && !retryDraft) ||
      preparing ||
      stopState.status === "stopping" ||
      stoppingRef.current ||
      stopBlockedRef.current ||
      stopState.status === "error" ||
      (failedDraftRef.current && retryDraft !== failedDraftRef.current)
    )
      return false;
    const isCurrent = captureSendIntent();
    if (!isCurrent()) return false;
    cancelPendingResume(true);
    let didSend = false;
    const submittedDraft = retryDraft ?? {
      input,
      revision: renderInputRevision,
      attachments,
      textAttachments,
      mentionAttachments,
      mentionTextContext,
      onAccepted: onDraftAccepted,
    };

    await submitOnce(async () => {
      if (!isCurrent()) return;
      const messageContent = submittedDraft.input;
      const attempt = {};
      attemptRef.current = attempt;
      setPreparing(true);
      setSendError(undefined);
      setSendErrorStatus(undefined);
      setStopState({ status: "idle" });
      try {
        if (
          !submittedDraft.regenerate &&
          earliestFailedUserMessageId &&
          !unacceptedIds.current.has(earliestFailedUserMessageId)
        ) {
          await deleteTrailingMessages({
            chatId: id,
            fromMessageId: earliestFailedUserMessageId,
            isCurrent,
          });
        }
        if (!isCurrent()) return;
        didSend = await handleSubmit(
          event,
          isCurrent,
          (acceptedIds) => {
            if (!chatId) {
              addOptimisticConversation(
                "New Chat",
                acceptedIds.chatId,
                acceptedIds.sessionId,
                messageContent,
              );
              if (acceptedIds.sessionId)
                window.history.replaceState(
                  {},
                  "",
                  getChatPath(
                    acceptedIds.sessionId,
                    acceptedIds.chatId,
                    catalogId,
                    catalogQuery,
                  ),
                );
            }
          },
          submittedDraft,
        );
      } catch (error) {
        if (isCurrent() && attemptRef.current === attempt) {
          setFailedDraft(submittedDraft);
          setSendError(
            getChatSendErrorMessage(
              error instanceof Error ? error : new Error(String(error)),
            ),
          );
        }
      } finally {
        if (isCurrent() && attemptRef.current === attempt) setPreparing(false);
      }
    }, isCurrent);
    return didSend;
  };

  const handleSendQueryMessages = async () => {
    await handleSendMessage({
      preventDefault() {},
    } as React.FormEvent<HTMLFormElement>);
  };

  // The ?q= deep-link behavior (prefill + provisioning-gated auto-fire)
  // lives entirely in this hook — extend it there, not here (chat#1847).
  useInitialMessageAutoSend({
    initialMessages,
    autoSendCancelled:
      initialAutoSendCancelled ||
      !fileScopeReady ||
      (selectedFileIds.length > 0 &&
        resolvedMentionScope !== mentionRequestScope),
    status,
    messagesLength: messages.length,
    sessionId,
    input,
    setInput,
    send: handleSendQueryMessages,
  });

  return {
    // States
    messages,
    status,
    input,
    isLoading,
    hasError,
    sendError,
    sendErrorStatus,
    failedDraftPreview:
      failedDraft && failedDraft.input !== input
        ? failedDraft.input || "Attached files"
        : undefined,
    hasFailedSubmission: !!failedDraft,
    retrySendMessage: async (event: React.FormEvent<HTMLFormElement>) => {
      if (!isActionCurrent()) return;
      if (failedDraftRef.current)
        await handleSendMessage(event, failedDraftRef.current);
    },
    discardFailedSubmission: () => {
      if (!isActionCurrent()) return;
      setFailedDraft(undefined);
      setSendError(undefined);
      setSendErrorStatus(undefined);
    },
    stopState,
    isGeneratingResponse,
    model,
    isLoadingSignedUrls,
    intelligentUI,
    captureSendIntent,

    // Actions
    isMessagePendingAdmission: (messageId: string) =>
      !isActionCurrent() || pendingAdmissionIds.current.has(messageId),
    editUnacceptedMessage: (messageId: string, text: string) => {
      if (!isActionCurrent()) return true;
      if (!unacceptedIds.current.has(messageId)) return false;
      if (pendingAdmissionIds.current.has(messageId)) return true;
      setInput(text);
      setFailedDraft(undefined);
      setSendError(undefined);
      setSendErrorStatus(undefined);
      setMessages((previous) =>
        previous.filter((message) => message.id !== messageId),
      );
      return true;
    },
    handleSendMessage,
    setInput,
    setMessages: setScopedMessages,
    setModel: setScopedModel,
    availableModels,
    stop,
    reload: handleReload,
    append,
  };
}
