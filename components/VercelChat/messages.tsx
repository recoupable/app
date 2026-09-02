"use client";

import { memo } from "react";
import { SpinnerIcon } from "./icons";
import { Response } from "@/components/ai-elements/response";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import Message from "./message";
import MessageFrame from "./MessageFrame";
import { EnhancedReasoning } from "@/components/reasoning/EnhancedReasoning";
import { cleanFileMentions } from "@/lib/chat/cleanFileMentions";
import { useVercelChatContext } from "@/providers/VercelChatProvider";
import { useCyclingText } from "@/hooks/useCyclingText";
import {
  WORKSPACE_SETUP_MESSAGES,
  WORKSPACE_SETUP_CYCLE_MS,
} from "@/lib/chat/workspaceSetupMessages";

interface TextMessagePartProps {
  text: string;
}

export function TextMessagePart({ text }: TextMessagePartProps) {
  const cleanedText = cleanFileMentions(text);

  return (
    <div className="flex flex-col gap-4">
      <Response>{cleanedText}</Response>
    </div>
  );
}

interface MessagesProps {
  children?: React.ReactNode;
}

const MessagesComponent = ({ children }: MessagesProps) => {
  const { messages, status, workspaceStatus } = useVercelChatContext();
  // Until the first reasoning or text chunk lands, the assistant's frame holds
  // the reasoning shell in its final position, so the wait for a provisioning
  // sandbox and the "Thinking..." that follows read as one state (app#2052).
  const last = messages[messages.length - 1];
  const awaitingFirstAssistantChunk =
    last?.role !== "assistant" ||
    !last.parts?.some((p) => p.type === "reasoning" || p.type === "text");
  const setupText = useCyclingText(
    WORKSPACE_SETUP_MESSAGES,
    WORKSPACE_SETUP_CYCLE_MS,
  );
  // Conversation component handles scrolling automatically
  // No need for manual scroll logic

  return (
    <Conversation className="flex-1 w-full">
      <ConversationContent className="flex flex-col gap-8 items-center w-full pt-6 pb-16 md:pt-8 md:pb-20">
        {children || null}
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}

        {(status === "submitted" || status === "streaming") &&
          (awaitingFirstAssistantChunk ? (
            <MessageFrame role="assistant">
              <EnhancedReasoning
                isStreaming
                placeholder={
                  workspaceStatus === "ready" ? undefined : setupText
                }
              />
            </MessageFrame>
          ) : (
            <div className="text-zinc-500 dark:text-zinc-400 w-full max-w-3xl mx-auto flex items-center gap-2">
              <div className="inline-block animate-spin">
                <SpinnerIcon />
              </div>
            </div>
          ))}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
};

export const Messages = memo(
  MessagesComponent,
  (prevProps: MessagesProps, nextProps: MessagesProps) =>
    prevProps.children === nextProps.children,
);
