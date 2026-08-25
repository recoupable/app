import {
  ToolUIPart,
  UIMessage,
  isToolOrDynamicToolUIPart,
  UIMessagePart,
  UIDataTypes,
  UITools,
  ChatStatus,
} from "ai";
import { Dispatch, SetStateAction, useContext } from "react";
import { cn } from "@/lib/utils";
import ViewingMessage from "./ViewingMessage";
import EditingMessage from "./EditingMessage";
import { getToolCallComponent, getToolResultComponent } from "./ToolComponents";
import MessageFileViewer from "./message-file-viewer";
import { EnhancedReasoning } from "@/components/reasoning/EnhancedReasoning";
import { Actions, Action } from "@/components/actions";
import { RefreshCcwIcon, Pencil } from "lucide-react";
import CopyButton from "@/components/CopyButton";
import { VercelChatContext } from "@/providers/VercelChatProvider";

interface MessagePartsProps {
  message: UIMessage;
  mode: "view" | "edit";
  setMode: Dispatch<SetStateAction<"view" | "edit">>;
  /** Injected when rendered outside a VercelChatProvider (onboarding pre-run). */
  status?: ChatStatus;
  reload?: () => void;
}

export function MessageParts({
  message,
  mode,
  setMode,
  status: statusProp,
  reload: reloadProp,
}: MessagePartsProps) {
  // Prefer injected props; fall back to the chat context when inside a provider.
  const ctx = useContext(VercelChatContext);
  const status = statusProp ?? ctx?.status;
  const reload = reloadProp ?? ctx?.reload ?? (() => {});
  return (
    <div className={cn("flex flex-col gap-4 w-full group")}>
      {message.parts?.map(
        (part: UIMessagePart<UIDataTypes, UITools>, partIndex) => {
          const { type } = part;
          const key = `message-${message.id}-part-${partIndex}`;

          if (type === "reasoning") {
            return (
              <EnhancedReasoning
                key={key}
                className="w-full"
                content={part.text}
                isStreaming={
                  status === "streaming" &&
                  partIndex === message.parts.length - 1
                }
                defaultOpen={true}
              />
            );
          }

          if (type === "file") {
            return <MessageFileViewer key={key} part={part} />;
          }

          if (type === "text") {
            const isLastMessage =
              message.role === "assistant" &&
              status !== "streaming" &&
              partIndex === message.parts.length - 1;

            if (mode === "view") {
              return (
                <div key={key}>
                  <ViewingMessage
                    message={message}
                    partText={part?.text || ""}
                  />
                  <Actions
                    className={cn(
                      "mt-0.5 gap-0.5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity",
                      {
                        "justify-start": message.role === "assistant",
                        "justify-end": message.role === "user",
                      },
                    )}
                  >
                    {message.role === "user" && (
                      <Action
                        onClick={() => setMode("edit")}
                        label="Edit"
                        tooltip="Edit message"
                      >
                        <Pencil className="!w-3 !h-3" />
                      </Action>
                    )}
                    {isLastMessage && (
                      <Action
                        onClick={() => reload()}
                        label="Retry"
                        tooltip="Regenerate this response"
                      >
                        <RefreshCcwIcon className="!w-3 !h-3" />
                      </Action>
                    )}
                    <CopyButton
                      text={part?.text || ""}
                      label="response"
                      tooltip="Copy response to clipboard"
                      iconClassName="!w-3 !h-3"
                      silent
                    />
                  </Actions>
                </div>
              );
            }

            if (mode === "edit") {
              return (
                <EditingMessage key={key} message={message} setMode={setMode} />
              );
            }
          }

          if (isToolOrDynamicToolUIPart(part)) {
            const { state } = part as ToolUIPart;
            if (state !== "output-available") {
              return getToolCallComponent(part as ToolUIPart);
            } else {
              return getToolResultComponent(part as ToolUIPart);
            }
          }
        },
      )}
    </div>
  );
}
