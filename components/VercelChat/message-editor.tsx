"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useDeleteTrailingMessages } from "@/hooks/useDeleteTrailingMessages";
import { EditingMessageProps } from "./EditingMessage";
import { useVercelChatContext } from "@/providers/VercelChatProvider";
import { TextUIPart } from "ai";

export function MessageEditor({ message, setMode }: EditingMessageProps) {
  const { reload } = useVercelChatContext();
  const text = (message.parts[0] as TextUIPart)?.text || "";
  const [draftContent, setDraftContent] = useState<string>(text);
  const { deleteTrailingMessages, isDeletingTrailingMessages } =
    useDeleteTrailingMessages({
      message,
      draftContent,
      onSuccess: () => {
        setMode("view");
        if (text !== draftContent) {
          reload();
        }
      },
    });
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
          disabled={isDeletingTrailingMessages}
          onClick={() => {
            void deleteTrailingMessages();
          }}
          className="rounded-xl"
        >
          {isDeletingTrailingMessages ? "Sending..." : "Send"}
        </Button>
      </div>
    </div>
  );
}
