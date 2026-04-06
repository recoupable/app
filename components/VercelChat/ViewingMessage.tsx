import React, { memo, useMemo } from "react";
import { UIMessage } from "ai";
import { cn } from "@/lib/utils";
import { TextMessagePart } from "./messages";
import { parseTextAttachments } from "@/lib/chat/parseTextAttachments";
import { TextFileCard } from "./TextFileCard";

interface ViewingMessageProps {
  message: UIMessage;
  partText: string;
}

const ViewingMessageComponent: React.FC<ViewingMessageProps> = ({
  message,
  partText,
}) => {
  // For user messages, parse out text attachments to display as cards
  const { textAttachments, remainingText } = useMemo(() => {
    if (message.role === "user") {
      return parseTextAttachments(partText);
    }
    return { textAttachments: [], remainingText: partText };
  }, [message.role, partText]);

  const hasAttachments = textAttachments.length > 0;
  const hasText = remainingText.length > 0;

  return (
    <div className="flex flex-col gap-2">
      {hasAttachments && (
        <div className="flex flex-wrap gap-2">
          {textAttachments.map((attachment, index) => (
            <TextFileCard
              key={index}
              filename={attachment.filename}
              lineCount={attachment.lineCount}
              type={attachment.type}
            />
          ))}
        </div>
      )}
      {(hasText || !hasAttachments) && (
        <div className="flex flex-row gap-2 items-center">
          <div
            data-testid="message-content"
            className={cn("flex flex-col gap-4 text-foreground dark:text-white", {
              "bg-muted px-4 py-2.5 rounded-3xl rounded-br-lg border border-border dark:border-gray-600 shadow-sm":
                message.role === "user",
            })}
          >
            <TextMessagePart text={remainingText || partText} />
          </div>
        </div>
      )}
    </div>
  );
};

const ViewingMessage = memo(ViewingMessageComponent, (prevProps, nextProps) => {
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.partText === nextProps.partText
  );
});

export default ViewingMessage;
