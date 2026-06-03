import { useChat } from "@ai-sdk/react";
import { useMessageLoader } from "./useMessageLoader";
import { useUserProvider } from "@/providers/UserProvder";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { useOrganization } from "@/providers/OrganizationProvider";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import getEarliestFailedUserMessageId from "@/lib/messages/getEarliestFailedUserMessageId";
import { generateUUID } from "@/lib/generateUUID";
import { useConversationsProvider } from "@/providers/ConversationsProvider";
import { UIMessage, FileUIPart } from "ai";
import useAvailableModels from "./useAvailableModels";
import { useLocalStorage } from "usehooks-ts";
import { DEFAULT_MODEL } from "@/lib/consts";
import { useAccountOverride } from "@/providers/AccountOverrideProvider";
import { usePaymentProvider } from "@/providers/PaymentProvider";
import useArtistFilesForMentions from "@/hooks/useArtistFilesForMentions";
import { useChatTransport } from "./useChatTransport";
import { usePrivy } from "@privy-io/react-auth";
import { TextAttachment } from "@/types/textAttachment";
import { formatTextAttachments } from "@/lib/chat/formatTextAttachments";
import { useDeleteTrailingMessages } from "./useDeleteTrailingMessages";
import { getFileContents } from "@/lib/sandboxes/getFileContents";
import getMimeFromPath from "@/lib/files/getMimeFromPath";
import { useStopChatWorkflow } from "./useStopChatWorkflow";

interface UseVercelChatProps {
  id: string;
  /**
   * Session id from the chat-bootstrap (`createSession`). When present
   * the transport targets `/api/chat/workflow`; when absent it falls
   * back to the legacy `/api/chat` for chats opened from history that
   * haven't been backfilled to the workflow architecture yet
   * (recoupable/chat#1747 Phase 2).
   */
  sessionId?: string;
  initialMessages?: UIMessage[];
  attachments?: FileUIPart[];
  textAttachments?: TextAttachment[];
}

/**
 * A hook that provides all chat functionality for the Vercel Chat component
 * Combines useChat, and useMessageLoader
 * Accesses user and artist data directly from providers
 */
export function useVercelChat({
  id,
  sessionId,
  initialMessages,
  attachments = [],
  textAttachments = [],
}: UseVercelChatProps) {
  const { userData } = useUserProvider();
  const { selectedArtist } = useArtistProvider();
  const { selectedOrgId: organizationId } = useOrganization();
  const { roomId } = useParams();

  const userId = userData?.account_id || userData?.id; // Use account_id if available, fallback to id
  const artistId = selectedArtist?.account_id;
  const messagesLengthRef = useRef<number>();
  const { addOptimisticConversation } = useConversationsProvider();
  const { data: availableModels = [] } = useAvailableModels();
  const [input, setInput] = useState("");
  const [model, setModel] = useLocalStorage("RECOUP_MODEL", DEFAULT_MODEL);
  const { refetchCredits } = usePaymentProvider();
  const { transport, getHeaders } = useChatTransport({
    chatId: id,
    sessionId,
  });
  const { authenticated, getAccessToken } = usePrivy();

  // Load artist files for mentions (from Supabase)
  const { files: allArtistFiles = [] } = useArtistFilesForMentions();

  // Extract mentioned file ids from input markup '@[display](id)'
  const selectedFileIds = useMemo(() => {
    const ids = new Set<string>();
    const regex = /@\[[^\]]+\]\(([^)]+)\)/g;
    let match: RegExpExecArray | null;
    // eslint-disable-next-line no-cond-assign
    while ((match = regex.exec(input))) {
      if (match[1]) ids.add(match[1]);
    }
    return Array.from(ids);
  }, [input]);

  // Resolve selected sandbox files for mention context and file attachments.
  const [mentionAttachments, setMentionAttachments] = useState<FileUIPart[]>([]);
  const [mentionTextContext, setMentionTextContext] = useState("");
  const [isLoadingSignedUrls, setIsLoadingSignedUrls] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!selectedFileIds.length) {
        if (!cancelled) setMentionAttachments((prev) => (prev.length ? [] : prev));
        if (!cancelled) setMentionTextContext((prev) => (prev ? "" : prev));
        if (!cancelled) setIsLoadingSignedUrls((prev) => (prev ? false : prev));
        return;
      }

      const idSet = new Set(selectedFileIds);
      const selected = allArtistFiles.filter((f) => idSet.has(f.id));
      if (selected.length === 0) {
        if (!cancelled) setMentionAttachments((prev) => (prev.length ? [] : prev));
        if (!cancelled) setMentionTextContext((prev) => (prev ? "" : prev));
        if (!cancelled) setIsLoadingSignedUrls((prev) => (prev ? false : prev));
        return;
      }

      try {
        if (!cancelled) setIsLoadingSignedUrls(true);

        const accessToken = await getAccessToken();
        if (!accessToken) {
          throw new Error("Please sign in to attach mentioned files");
        }

        const results = await Promise.all(
          selected.map(async (f) => {
            const fileResult = await getFileContents(accessToken, f.path);
            const mimeType = f.mime_type || getMimeFromPath(f.path);
            return {
              path: f.path,
              mimeType,
              content: fileResult.content,
              dataUrl: fileResult.imageUrl,
            };
          }),
        );

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
          setMentionTextContext(textBlocks.length ? textBlocks.join("\n\n") : "");
        if (!cancelled) setIsLoadingSignedUrls(false);
      } catch (e) {
        console.error(e);
        if (!cancelled) setMentionAttachments((prev) => (prev.length ? [] : prev));
        if (!cancelled) setMentionTextContext((prev) => (prev ? "" : prev));
        if (!cancelled) setIsLoadingSignedUrls((prev) => (prev ? false : prev));
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [selectedFileIds, allArtistFiles, getAccessToken]);

  const { accountIdOverride } = useAccountOverride();

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

  const { messages, status, stop: aiStop, sendMessage, setMessages, regenerate } =
    useChat({
      id,
      transport,
      experimental_throttle: 100,
      generateId: generateUUID,
      onError: (e) => {
        console.error("An error occurred, please try again!", e);
        toast.error("An error occurred, please try again!");
      },
      onFinish: async () => {
        // Update credits after AI response completes
        await refetchCredits();
      },
    });

  // Workflow chats: await the backend cancel and let SSE close naturally —
  // calling aiStop here would tear down SSE before in-flight chunks reach
  // the UI and frontend/DB would disagree on reload. Legacy chats abort
  // locally via the AI SDK's `stop()`.
  const { stop: stopWorkflow, isStopping } = useStopChatWorkflow(id);
  const stop = useCallback(async () => {
    if (sessionId) {
      await stopWorkflow();
      return;
    }
    await aiStop();
  }, [aiStop, sessionId, stopWorkflow]);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const headers = await getHeaders();

    // Combine all attachments
    const combined: FileUIPart[] = [];
    if (attachments && attachments.length > 0) combined.push(...attachments);
    if (mentionAttachments.length > 0) combined.push(...mentionAttachments);

    // Separate audio files (can't be sent to AI as file parts)
    const audioAttachments = combined.filter((f) =>
      f.mediaType?.startsWith("audio/"),
    );
    const nonAudioAttachments = combined.filter(
      (f) => !f.mediaType?.startsWith("audio/"),
    );

    // Build message text with text file content and audio URLs prepended
    let messageText = input;

    // Prepend text file content (markdown, CSV)
    const textContext = formatTextAttachments(textAttachments);
    if (textContext) {
      messageText = textContext + "\n\n" + messageText;
    }

    // Prepend mentioned sandbox file text content.
    if (mentionTextContext) {
      messageText = mentionTextContext + "\n\n" + messageText;
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

    sendMessage(payload, { body: chatRequestBody, headers });
    setInput("");
  };

  const append = async (message: UIMessage) => {
    const headers = await getHeaders();
    sendMessage(message, { body: chatRequestBody, headers });
  };

  const handleReload = useCallback(async () => {
    const headers = await getHeaders();
    await regenerate({ body: chatRequestBody, headers });
  }, [getHeaders, regenerate, chatRequestBody]);

  // Keep messagesRef in sync with messages
  messagesLengthRef.current = messages.length;

  const { isLoading: isMessagesLoading, hasError } = useMessageLoader(
    sessionId,
    messages.length === 0 ? id : undefined,
    userId,
    setMessages,
  );

  // Only show loading state if:
  // 1. We're loading messages
  // 2. We have a roomId (meaning we're intentionally loading a chat)
  // 3. We don't already have messages (important for redirects)
  const isLoading = isMessagesLoading && !!id && messages.length === 0;

  const isGeneratingResponse = ["streaming", "submitted"].includes(status);

  const silentlyUpdateUrl = useCallback(() => {
    if (!sessionId) return;
    window.history.replaceState(
      {},
      "",
      `/sessions/${sessionId}/chats/${id}`,
    );
  }, [id, sessionId]);

  const handleSendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (earliestFailedUserMessageId) {
      await deleteTrailingMessages({
        chatId: id,
        fromMessageId: earliestFailedUserMessageId,
      });
    }

    // Capture the input value before it's cleared by handleSubmit
    const messageContent = input;

    // Submit the message
    handleSubmit(event);

    if (!roomId) {
      // Optimistically append a temporary conversation so it appears in Recent Chats
      // It will be replaced by the real conversation after the updates/refetch
      addOptimisticConversation("New Chat", id, sessionId, messageContent);
      silentlyUpdateUrl();
    }
  };

  const handleSendQueryMessages = useCallback(
    async (initialMessage: UIMessage) => {
      silentlyUpdateUrl();
      const headers = await getHeaders();
      sendMessage(initialMessage, { body: chatRequestBody, headers });
    },
    [silentlyUpdateUrl, sendMessage, chatRequestBody, getHeaders],
  );

  useEffect(() => {
    const isFullyLoggedIn = userId;
    const isReady = status === "ready";
    const hasMessages = messages.length > 1;
    const hasInitialMessages = initialMessages && initialMessages.length > 0;
    // Wait for authentication before sending initial message to avoid 401 errors
    if (
      !hasInitialMessages ||
      !isReady ||
      hasMessages ||
      !isFullyLoggedIn ||
      !authenticated
    )
      return;
    handleSendQueryMessages(initialMessages[0]);
  }, [
    initialMessages,
    status,
    userId,
    handleSendQueryMessages,
    messages.length,
    authenticated,
  ]);

  return {
    // States
    messages,
    status,
    input,
    isLoading,
    hasError,
    isGeneratingResponse,
    isStopping,
    model,
    isLoadingSignedUrls,

    // Actions
    handleSendMessage,
    setInput,
    setMessages,
    setModel,
    availableModels,
    stop,
    reload: handleReload,
    append,
  };
}
