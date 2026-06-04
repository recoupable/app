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

// Interface for the context data
interface VercelChatContextType {
  id: string | undefined;
  /** Recoup API chat id (`workflowChatId ?? id`). Use for trailing delete and other API calls. */
  transportChatId: string;
  sessionId: string | undefined;
  messages: UIMessage[];
  availableModels: GatewayLanguageModelEntry[];
  status: ChatStatus;
  isLoading: boolean;
  hasError: boolean;
  isGeneratingResponse: boolean;
  isLoadingSignedUrls: boolean;
  handleSendMessage: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  stop: UseChatHelpers<UIMessage>["stop"];
  setInput: (input: string) => void;
  input: string;
  setMessages: UseChatHelpers<UIMessage>["setMessages"];
  reload: () => void;
  append: (message: UIMessage) => void;
  attachments: FileUIPart[];
  pendingAttachments: FileUIPart[];
  setAttachments: (
    attachments: FileUIPart[] | ((prev: FileUIPart[]) => FileUIPart[])
  ) => void;
  removeAttachment: (index: number) => void;
  clearAttachments: () => void;
  hasPendingUploads: boolean;
  textAttachments: TextAttachment[];
  setTextAttachments: (
    attachments: TextAttachment[] | ((prev: TextAttachment[]) => TextAttachment[])
  ) => void;
  addTextAttachment: (file: File, type: TextAttachment["type"]) => Promise<void>;
  removeTextAttachment: (index: number) => void;
  model: string;
  setModel: (model: string) => void;
  /** Workspace (session + sandbox) lifecycle; gates Send + drives the status dot. */
  workspaceStatus: WorkspaceStatus;
}

// Create the context
const VercelChatContext = createContext<VercelChatContextType | undefined>(
  undefined
);

// Props for the provider component
interface VercelChatProviderProps {
  children: ReactNode;
  chatId: string;
  /**
   * Session id for recoup-api `/api/chat/workflow`. Absent only on the
   * new-chat bootstrap path until provisioning resolves; Send is gated on
   * `isBootstrapPreparing` until it lands.
   */
  sessionId?: string;
  /** Api-minted chat id from bootstrap when `chatId` is a placeholder. */
  workflowChatId?: string;
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
  sessionId,
  workflowChatId,
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
    transportChatId,
    status,
    isLoading,
    hasError,
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
  } = useVercelChat({
    id: chatId,
    sessionId,
    workflowChatId,
    initialMessages,
    attachments,
    textAttachments,
  });

  const reload = useCallback(() => {
    return originalReload();
  }, [originalReload]);

  // When a message is sent successfully, clear the attachments
  const handleSendMessageWithClear = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    await handleSendMessage(event);

    // Clear attachments after sending
    clearAttachments();
  };

  // Create the context value object
  const contextValue: VercelChatContextType = {
    id: chatId,
    transportChatId,
    sessionId,
    messages,
    model,
    availableModels,
    status,
    isLoading,
    hasError,
    isGeneratingResponse,
    isLoadingSignedUrls,
    handleSendMessage: handleSendMessageWithClear,
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
      "useVercelChatContext must be used within a VercelChatProvider"
    );
  }

  return context;
}
