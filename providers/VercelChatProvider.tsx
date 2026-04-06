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

// Interface for the context data
interface VercelChatContextType {
  id: string | undefined;
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
}

// Create the context
const VercelChatContext = createContext<VercelChatContextType | undefined>(
  undefined
);

// Props for the provider component
interface VercelChatProviderProps {
  children: ReactNode;
  chatId: string;
  initialMessages?: UIMessage[];
}

/**
 * Provider component that wraps its children with the VercelChat context
 */
export function VercelChatProvider({
  children,
  chatId,
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
