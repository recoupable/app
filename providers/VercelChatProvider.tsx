import type { CatalogQueryInput } from "@/lib/intelligent-ui/chat/getChatCatalogHost";
import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { useVercelChat } from "@/hooks/useVercelChat";
import { UseChatHelpers } from "@ai-sdk/react";
import useAttachments from "@/hooks/useAttachments";
import { useTextAttachments } from "@/hooks/useTextAttachments";
import { ChatStatus, FileUIPart, UIMessage } from "ai";
import { useArtistProvider } from "./ArtistProvider";
import { GatewayLanguageModelEntry } from "@ai-sdk/gateway";
import { TextAttachment } from "@/types/textAttachment";
import type { WorkspaceStatus } from "@/components/VercelChat/WorkspaceStatusIndicator";
import type { ChatSnapshotBinding } from "@/lib/intelligent-ui/chat/createSnapshotConsumer";

// Interface for the context data
interface VercelChatContextType {
  id: string | undefined;
  sessionId: string | undefined;
  messages: UIMessage[];
  availableModels: GatewayLanguageModelEntry[];
  status: ChatStatus;
  isLoading: boolean;
  hasError: boolean;
  retryHistory?: () => void;
  sendError?: string;
  sendErrorStatus?: number;
  failedDraftPreview?: string;
  hasFailedSubmission?: boolean;
  retrySendMessage?: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  discardFailedSubmission?: () => void;
  stopState?: {
    status: "idle" | "stopping" | "stopped" | "inactive" | "error";
    message?: string;
    httpStatus?: number;
  };
  editUnacceptedMessage?: (messageId: string, text: string) => boolean;
  isMessagePendingAdmission?: (messageId: string) => boolean;
  isGeneratingResponse: boolean;
  isLoadingSignedUrls: boolean;
  handleSendMessage: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  stop: UseChatHelpers<UIMessage>["stop"];
  setInput: (input: string) => void;
  input: string;
  setMessages: UseChatHelpers<UIMessage>["setMessages"];
  reload: (editedMessage?: UIMessage) => void;
  append: (message: UIMessage) => void;
  attachments: FileUIPart[];
  pendingAttachments: FileUIPart[];
  setAttachments: (
    attachments: FileUIPart[] | ((prev: FileUIPart[]) => FileUIPart[]),
  ) => void;
  removeAttachment: (index: number) => void;
  clearAttachments: () => void;
  hasPendingUploads: boolean;
  textAttachments: TextAttachment[];
  setTextAttachments: (
    attachments:
      | TextAttachment[]
      | ((prev: TextAttachment[]) => TextAttachment[]),
  ) => void;
  addTextAttachment: (
    file: File,
    type: TextAttachment["type"],
    isCurrent?: () => boolean,
  ) => Promise<void>;
  removeTextAttachment: (index: number) => void;
  model: string;
  setModel: (model: string) => void;
  /** Workspace (session + sandbox) lifecycle; gates Send + drives the status dot. */
  workspaceStatus: WorkspaceStatus;
  intelligentUI?: ChatSnapshotBinding;
  captureSendIntent?: () => () => boolean;
}

// Create the context. Exported so presentational components (e.g. Message /
// MessageParts) can read it optionally and fall back to props when rendered
// outside a provider — see the onboarding first-task pre-run.
export const VercelChatContext = createContext<
  VercelChatContextType | undefined
>(undefined);

// Props for the provider component
interface VercelChatProviderProps {
  children: ReactNode;
  chatId: string;
  catalogId?: string | string[];
  catalogQuery?: CatalogQueryInput;
  /**
   * Session id for recoup-api `/api/chat`. Absent only on the
   * new-chat bootstrap path until provisioning resolves; the transport holds
   * a send until then.
   */
  sessionId?: string;
  /** Api-minted chat id from bootstrap when `chatId` is a placeholder. */
  workflowChatId?: string;
  /** Distinguishes a bootstrap placeholder from a routable canonical chatId. */
  isNewChatBootstrap?: boolean;
  /** Workspace (session + sandbox) lifecycle; gates Send + drives the status dot. */
  workspaceStatus?: WorkspaceStatus;
  initialMessages?: UIMessage[];
}

/**
 * Provider component that wraps its children with the VercelChat context
 */
export function VercelChatProvider({
  children,
  chatId,
  catalogId,
  catalogQuery,
  sessionId,
  workflowChatId,
  isNewChatBootstrap,
  workspaceStatus = "ready",
  initialMessages,
}: VercelChatProviderProps) {
  const {
    attachments,
    pendingAttachments,
    setAttachments,
    removeAttachment,
    clearAttachments: clearFileAttachments,
    hasPendingUploads,
  } = useAttachments();

  const {
    textAttachments,
    setTextAttachments,
    addTextAttachment,
    removeTextAttachment,
    clearTextAttachments,
  } = useTextAttachments();

  const { updateChatState } = useArtistProvider();

  // Compose clear function for both attachment types
  const clearAttachments = useCallback(() => {
    clearFileAttachments();
    clearTextAttachments();
  }, [clearFileAttachments, clearTextAttachments]);

  // Use the useVercelChat hook to get the chat state and functions
  const {
    messages,
    status,
    isLoading,
    hasError,
    retryHistory,
    sendError,
    sendErrorStatus,
    failedDraftPreview,
    hasFailedSubmission,
    retrySendMessage,
    discardFailedSubmission,
    stopState,
    editUnacceptedMessage,
    isMessagePendingAdmission,
    isGeneratingResponse,
    isLoadingSignedUrls,
    handleSendMessage,
    stop,
    setInput,
    input,
    setMessages,
    reload: originalReload,
    append,
    model,
    setModel,
    availableModels,
    intelligentUI,
    captureSendIntent,
  } = useVercelChat({
    id: chatId,
    catalogId,
    catalogQuery,
    sessionId,
    workflowChatId,
    isNewChatBootstrap,
    initialMessages,
    attachments,
    textAttachments,
    workspaceStatus,
    onDraftAccepted: () => {
      setAttachments((previous) =>
        previous.filter((part) => !attachments.includes(part)),
      );
      setTextAttachments((previous) =>
        previous.filter((part) => !textAttachments.includes(part)),
      );
    },
  });

  const reload = useCallback(
    (editedMessage?: UIMessage) => {
      return originalReload(editedMessage);
    },
    [originalReload],
  );

  // Create the context value object
  const contextValue: VercelChatContextType = {
    id: chatId,
    sessionId,
    messages,
    model,
    availableModels,
    status,
    isLoading,
    hasError,
    retryHistory,
    sendError,
    sendErrorStatus,
    failedDraftPreview,
    hasFailedSubmission,
    retrySendMessage,
    discardFailedSubmission,
    stopState,
    editUnacceptedMessage,
    isMessagePendingAdmission,
    isGeneratingResponse,
    isLoadingSignedUrls,
    handleSendMessage: async (event) => {
      await handleSendMessage(event);
    },
    stop,
    setInput,
    input,
    setMessages,
    setModel,
    reload,
    append,
    attachments,
    pendingAttachments,
    setAttachments,
    removeAttachment,
    clearAttachments,
    hasPendingUploads,
    textAttachments,
    setTextAttachments,
    addTextAttachment,
    removeTextAttachment,
    workspaceStatus,
    intelligentUI,
    captureSendIntent,
  };

  // Send chat status and messages to ArtistProvider
  useEffect(() => {
    updateChatState(status, messages);
  }, [status, messages, updateChatState]);

  // Provide the context value to children
  return (
    <VercelChatContext.Provider value={contextValue}>
      {children}
    </VercelChatContext.Provider>
  );
}

/**
 * Custom hook to use the VercelChat context
 */
export function useVercelChatContext() {
  const context = useContext(VercelChatContext);

  if (context === undefined) {
    throw new Error(
      "useVercelChatContext must be used within a VercelChatProvider",
    );
  }

  return context;
}
