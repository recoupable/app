import {
  ToolUIPart,
  UIMessage,
  isToolOrDynamicToolUIPart,
  getToolOrDynamicToolName,
  UIMessagePart,
  UIDataTypes,
  UITools,
} from "ai";
import { Dispatch, SetStateAction } from "react";
import { cn } from "@/lib/utils";
import ViewingMessage from "./ViewingMessage";
import EditingMessage from "./EditingMessage";
import { getToolCallComponent, getToolResultComponent } from "./ToolComponents";
import { ToolCall } from "./tools/agent/ToolCall";
import { isAgentToolName } from "./tools/agent/renderTool";
import MessageFileViewer from "./message-file-viewer";
import { EnhancedReasoning } from "@/components/reasoning/EnhancedReasoning";
import { Actions, Action } from "@/components/actions";
import { RefreshCcwIcon, Pencil } from "lucide-react";
import CopyAction from "./CopyAction";
import { useVercelChatContext } from "@/providers/VercelChatProvider";

interface MessagePartsProps {
  message: UIMessage;
  mode: "view" | "edit";
  setMode: Dispatch<SetStateAction<"view" | "edit">>;
}

export function MessageParts({ message, mode, setMode }: MessagePartsProps) {
  const { status, reload } = useVercelChatContext();
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
                    <CopyAction text={part?.text || ""} />
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
            const toolPart = part as ToolUIPart;
            if (isAgentToolName(getToolOrDynamicToolName(toolPart))) {
              return (
                <ToolCall
                  key={key}
                  part={toolPart}
                  isStreaming={
                    status === "streaming" &&
                    partIndex === message.parts.length - 1
                  }
                />
              );
            }
            if (toolPart.state !== "output-available") {
              return getToolCallComponent(toolPart);
            } else {
              return getToolResultComponent(toolPart);
            }
          }
        },
      )}
    </div>
  );
}
