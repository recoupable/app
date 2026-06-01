"use client";

import { createContext, useContext } from "react";
import { UseChatHelpers } from "@ai-sdk/react";
import { ChatStatus, FileUIPart, UIMessage } from "ai";
import { GatewayLanguageModelEntry } from "@ai-sdk/gateway";
import { TextAttachment } from "@/types/textAttachment";

export interface VercelChatContextType {
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
  isBootstrapPreparing: boolean;
}

export const VercelChatContext = createContext<
  VercelChatContextType | undefined
>(undefined);

export function useVercelChatContext() {
  const context = useContext(VercelChatContext);

  if (context === undefined) {
    throw new Error(
      "useVercelChatContext must be used within a VercelChatProvider",
    );
  }

  return context;
}
