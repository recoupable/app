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
import { getChatPath } from "@/lib/chat/getChatPath";
import { usePersistSelectedModel } from "./usePersistSelectedModel";

interface UseVercelChatProps {
  id: string;
  /**
   * Session id from `/sessions/[sessionId]/chats/[chatId]` (always
   * present) or the new-chat bootstrap (absent until provisioning
   * resolves). Send is gated upstream while it's absent, so the transport
   * never fires without it.
   */
  sessionId?: string;
  /**
   * Api-minted chat id from bootstrap when `id` is a client placeholder.
   * Used as the transport / message-load / URL target; falls back to `id`.
   */
  workflowChatId?: string;
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
  workflowChatId,
  initialMessages,
  attachments = [],
  textAttachments = [],
}: UseVercelChatProps) {
  const { userData } = useUserProvider();
  const { selectedArtist } = useArtistProvider();
  const { selectedOrgId: organizationId } = useOrganization();
  const { chatId } = useParams<{ chatId?: string }>();

  const userId = userData?.account_id || userData?.id; // Use account_id if available, fallback to id
  const artistId = selectedArtist?.account_id;
  const messagesLengthRef = useRef<number>();
  const { addOptimisticConversation } = useConversationsProvider();
  const { data: availableModels = [] } = useAvailableModels();
  const [input, setInput] = useState("");
  const [model, setModel] = useLocalStorage("RECOUP_MODEL", DEFAULT_MODEL);
  const { refetchCredits } = usePaymentProvider();
  // The api-minted chat id once bootstrap resolves; before then `id` is a
  // client placeholder. Drives the transport, message load, and URL so
  // sends/persistence target the row recoup-api actually created.
  const transportChatId = workflowChatId ?? id;
  const { transport, getHeaders } = useChatTransport({
    chatId: transportChatId,
    sessionId,
  });
  const { authenticated, getAccessToken } = usePrivy();

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

  const { messages, status, stop, sendMessage, setMessages, regenerate } =
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

    // Land the selected model in chats.model_id before the send fires.
    await persistSelectedModel();

    sendMessage(payload, { body: chatRequestBody, headers });
    setInput("");
  };

  const append = async (message: UIMessage) => {
    const headers = await getHeaders();
    // Retry/Edit and programmatic sends bypass handleSubmit, so persist the
    // selected model here too before the workflow reads chats.model_id.
    await persistSelectedModel();
    sendMessage(message, { body: chatRequestBody, headers });
  };

  const handleReload = useCallback(async () => {
    const headers = await getHeaders();
    // Retry/Edit (MessageParts + message-editor) call reload() → regenerate,
    // bypassing handleSubmit; persist the selected model first so the
    // regenerated turn bills it, not the previous/default model.
    await persistSelectedModel();
    await regenerate({ body: chatRequestBody, headers });
  }, [getHeaders, regenerate, chatRequestBody, persistSelectedModel]);

  // Keep messagesRef in sync with messages
  messagesLengthRef.current = messages.length;

  // Only load persisted history for an existing chat opened from a
  // canonical `/sessions/[sessionId]/chats/[chatId]` URL (route `chatId`
  // present). A new chat from the bootstrap has nothing to load, so we
  // skip the fetch — avoiding a spinner flashing over the input the user
  // is already typing into while provisioning resolves.
  const { isLoading: isMessagesLoading, hasError } = useMessageLoader(
    sessionId,
    messages.length === 0 && chatId ? transportChatId : undefined,
    userId,
    setMessages,
  );

  // Only show loading state when fetching persisted history for an existing chat.
  const isLoading = isMessagesLoading && !!id && messages.length === 0;

  const isGeneratingResponse = ["streaming", "submitted"].includes(status);

  const silentlyUpdateUrl = useCallback(() => {
    if (!sessionId) return;
    window.history.replaceState(
      {},
      "",
      getChatPath(sessionId, transportChatId),
    );
  }, [transportChatId, sessionId]);

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

    if (!chatId) {
      // New chat from `/` or `/chat` — sidebar + URL update on first send.
      addOptimisticConversation(
        "New Chat",
        transportChatId,
        sessionId,
        messageContent,
      );
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
