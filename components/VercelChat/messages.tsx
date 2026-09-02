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
import PendingMessagePreview from "./PendingMessagePreview";
import { EnhancedReasoning } from "@/components/reasoning/EnhancedReasoning";
import { cleanFileMentions } from "@/lib/chat/cleanFileMentions";
import { useVercelChatContext } from "@/providers/VercelChatProvider";

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
  const { messages, status, sendArmed, input } = useVercelChatContext();
  // Nothing *visible* from the assistant has arrived yet for the in-flight
  // turn. Checking the role alone was too narrow: the assistant message is
  // created on its first chunk, which is a `step-start`, and the reasoning
  // part can follow seconds later — long enough for the placeholder to
  // unmount into the bare spinner and back (measured ~1.7s, app#2052).
  const last = messages[messages.length - 1];
  const awaitingFirstAssistantChunk =
    last?.role !== "assistant" ||
    !last.parts.some((p) => p.type === "reasoning" || p.type === "text");
  // Conversation component handles scrolling automatically
  // No need for manual scroll logic

  return (
    <Conversation className="flex-1 w-full">
      <ConversationContent className="flex flex-col gap-8 items-center w-full pt-6 pb-16 md:pt-8 md:pb-20">
        {children || null}
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}

        {sendArmed && input.trim() && <PendingMessagePreview text={input} />}

        {(status === "submitted" || status === "streaming") &&
          (awaitingFirstAssistantChunk ? (
            // Same shell as the workspace-setup placeholder and the reasoning
            // stream, so cold start → send → thinking is one continuous
            // element rather than a placeholder, then a spinner, then a
            // reasoning block (app#2052).
            <div className="w-full max-w-3xl mx-auto">
              <EnhancedReasoning isStreaming />
            </div>
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
    prevProps.children === nextProps.children
);
