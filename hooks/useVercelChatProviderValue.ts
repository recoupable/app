"use client";

import { useCallback, useEffect } from "react";
import { UIMessage } from "ai";
import { useVercelChat } from "@/hooks/useVercelChat";
import useAttachments from "@/hooks/useAttachments";
import { useTextAttachments } from "@/hooks/useTextAttachments";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { VercelChatContextType } from "@/providers/VercelChatContext";

interface UseVercelChatProviderValueOptions {
  chatId: string;
  sessionId?: string;
  workflowChatId?: string;
  isBootstrapPreparing?: boolean;
  initialMessages?: UIMessage[];
}

export function useVercelChatProviderValue({
  chatId,
  sessionId,
  workflowChatId,
  isBootstrapPreparing = false,
  initialMessages,
}: UseVercelChatProviderValueOptions): VercelChatContextType {
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

  const clearAttachments = useCallback(() => {
    clearFileAttachments();
    clearTextAttachments();
  }, [clearFileAttachments, clearTextAttachments]);

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
    sessionId,
    workflowChatId,
    initialMessages,
    attachments,
    textAttachments,
  });

  const reload = useCallback(() => {
    return originalReload();
  }, [originalReload]);

  const handleSendMessageWithClear = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    await handleSendMessage(event);
    clearAttachments();
  };

  useEffect(() => {
    updateChatState(status, messages);
  }, [status, messages, updateChatState]);

  return {
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
    isBootstrapPreparing,
  };
}
