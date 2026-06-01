"use client";

import { ReactNode } from "react";
import { UIMessage } from "ai";
import { useVercelChatProviderValue } from "@/hooks/useVercelChatProviderValue";
import { VercelChatContext } from "@/providers/VercelChatContext";

export { useVercelChatContext } from "@/providers/VercelChatContext";
export type { VercelChatContextType } from "@/providers/VercelChatContext";

interface VercelChatProviderProps {
  children: ReactNode;
  chatId: string;
  /**
   * Session id from the new-chat bootstrap. Forwarded into
   * `useVercelChat` -> `useChatTransport`; presence flips the
   * transport to recoup-api's `/api/chat/workflow`.
   */
  sessionId?: string;
  workflowChatId?: string;
  isBootstrapPreparing?: boolean;
  initialMessages?: UIMessage[];
}

export function VercelChatProvider({
  children,
  chatId,
  sessionId,
  workflowChatId,
  isBootstrapPreparing,
  initialMessages,
}: VercelChatProviderProps) {
  const contextValue = useVercelChatProviderValue({
    chatId,
    sessionId,
    workflowChatId,
    isBootstrapPreparing,
    initialMessages,
  });

  return (
    <VercelChatContext.Provider value={contextValue}>
      {children}
    </VercelChatContext.Provider>
  );
}
