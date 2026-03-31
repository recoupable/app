"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { clientDeleteTrailingMessages } from "@/lib/messages/clientDeleteTrailingMessages";
import { EditingMessageProps } from "./EditingMessage";
import { useVercelChatContext } from "@/providers/VercelChatProvider";
import { TextUIPart } from "ai";

export function MessageEditor({ message, setMode }: EditingMessageProps) {
  const { setMessages, reload } = useVercelChatContext();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const text = (message.parts[0] as TextUIPart)?.text || "";
  const [draftContent, setDraftContent] = useState<string>(text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, []);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
    }
  };

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraftContent(event.target.value);
    adjustHeight();
  };

  // Memoize the submit handler to prevent unnecessary re-renders
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);

    await clientDeleteTrailingMessages({
      id: message.id,
    });

    // @ts-expect-error todo: support UIMessage in setMessages
    setMessages((messages) => {
      const index = messages.findIndex((m) => m.id === message.id);

      if (index !== -1) {
        const updatedMessage = {
          ...message,
          content: draftContent,
          parts: [{ type: "text", text: draftContent }],
        };

        return [...messages.slice(0, index), updatedMessage];
      }

      return messages;
    });

    setMode("view");

    // Only reload if the content has actually changed
    if (text !== draftContent) {
      reload();
    }
  }, [message.id, text, draftContent, setMessages, setMode, reload]);

  return (
    <div className="flex flex-col gap-2 w-full">
      <Textarea
        data-testid="message-editor"
        ref={textareaRef}
        className="bg-transparent outline-none overflow-hidden resize-none !text-base rounded-xl w-full"
        value={draftContent}
        onChange={handleInput}
      />

      <div className="flex flex-row gap-2 justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setMode("view");
          }}
          className="rounded-xl"
        >
          Cancel
        </Button>
        <Button
          data-testid="message-editor-send-button"
          variant="default"
          size="sm"
          disabled={isSubmitting}
          onClick={handleSubmit}
          className="rounded-xl"
        >
          {isSubmitting ? "Sending..." : "Send"}
        </Button>
      </div>
    </div>
  );
}
