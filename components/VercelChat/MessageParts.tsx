import {
  ToolUIPart,
  UIMessage,
  isToolOrDynamicToolUIPart,
  UIMessagePart,
  UIDataTypes,
  UITools,
  ChatStatus,
} from "ai";
import { Dispatch, SetStateAction, useContext, lazy, Suspense } from "react";
import { cn } from "@/lib/utils";
import { collapseTodoParts } from "@/lib/chat/collapseTodoParts";
import ViewingMessage from "./ViewingMessage";
import EditingMessage from "./EditingMessage";
import { getToolCallComponent, getToolResultComponent } from "./ToolComponents";
import MessageFileViewer from "./message-file-viewer";
import { EnhancedReasoning } from "@/components/reasoning/EnhancedReasoning";
import { Actions, Action } from "@/components/actions";
import { RefreshCcwIcon, Pencil } from "lucide-react";
import { ModelRoutingStatus } from "./ModelRoutingStatus";
import CopyButton from "@/components/CopyButton";
import { VercelChatContext } from "@/providers/VercelChatProvider";
import SnapshotRenderBoundary from "@/components/IntelligentUI/SnapshotRenderBoundary";
import { getAnswerText } from "@/lib/intelligent-ui/presentation/getAnswerText";
import { isChatIntelligentUIEnabled } from "@/lib/intelligent-ui/chat/isChatIntelligentUIEnabled";

const ChatSnapshot = lazy(
  () => import("@/components/IntelligentUI/ChatSnapshot"),
);

const actionsClassName =
  "mt-0.5 items-start gap-0.5 has-[details[open]]:opacity-100 has-[details[open]]:pointer-events-auto opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto [@media(hover:none)]:opacity-100 [@media(hover:none)]:pointer-events-auto transition-opacity";
const copyButtonProps = {
  label: "response",
  tooltip: "Copy response to clipboard",
  variant: "ghost" as const,
  silent: true,
  iconClassName: "!w-3 !h-3",
  // Match the Action treatment used by Retry and Edit beside it.
  className:
    "size-8 p-1.5 rounded-full text-muted-foreground hover:text-foreground transition-colors",
};

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
  // `status` is chat-wide. A tool part left mid-run by a stopped earlier turn
  // must not spin again when a later turn streams, so only the message that
  // owns the stream counts as streaming.
  const messages = ctx?.messages;
  const isOwnStream =
    status === "streaming" &&
    (!messages || messages[messages.length - 1]?.id === message.id);
  const parts = collapseTodoParts(message.parts ?? []);
  const lastTextIndex = parts.findLastIndex((part) => part.type === "text");
  const binding =
    message.role === "assistant" && isChatIntelligentUIEnabled()
      ? ctx?.intelligentUI
      : undefined;
  // Resolve once so rendering and copying use the same accepted revision.
  const snapshots = binding
    ? parts.map((part) => {
        if (
          part.type !== "data-intelligent-ui-snapshot" ||
          !("id" in part) ||
          typeof part.id !== "string"
        )
          return undefined;
        const surface = binding.consumer.getSnapshot(
          message.id,
          part.id,
          binding.scopeKey,
        );
        const text = surface
          ? getAnswerText(surface)
          : binding.consumer.getFallback(message.id, part, binding.scopeKey);
        return text === undefined ? undefined : { surface, text };
      })
    : [];
  const hasAcceptedUI = snapshots.some(Boolean);
  const responseText = hasAcceptedUI
    ? parts
        .map((part, index) =>
          part.type === "text" ? part.text : snapshots[index]?.text,
        )
        .filter(Boolean)
        .join("\n\n")
    : undefined;
  return (
    <div className={cn("flex flex-col gap-4 w-full group")}>
      {parts.map((part: UIMessagePart<UIDataTypes, UITools>, partIndex) => {
        const { type } = part;
        const key = `message-${message.id}-part-${partIndex}`;

        if (type === "data-intelligent-ui-snapshot") {
          const snapshot = snapshots[partIndex];
          if (!binding || !snapshot) return null;
          const { surface, text } = snapshot;
          return surface ? (
            <SnapshotRenderBoundary
              key={`${message.id}:${binding.scopeKey}:${surface.id}`}
              revision={surface.revision}
              fallback={text}
            >
              <Suspense
                fallback={
                  <p className="whitespace-pre-wrap text-base leading-7 [overflow-wrap:anywhere]">
                    {text}
                  </p>
                }
              >
                <ChatSnapshot
                  surface={surface}
                  stateScope={
                    binding.consumer.getStateScope(binding.scopeKey) ??
                    binding.scopeKey
                  }
                  messageId={message.id}
                />
              </Suspense>
            </SnapshotRenderBoundary>
          ) : (
            <p
              key={`${message.id}:${binding.scopeKey}:${partIndex}`}
              className="whitespace-pre-wrap text-base leading-7 [overflow-wrap:anywhere]"
            >
              {text}
            </p>
          );
        }

        if (type === "reasoning") {
          return (
            <EnhancedReasoning
              key={key}
              className="w-full"
              content={part.text}
              isStreaming={
                status === "streaming" && partIndex === parts.length - 1
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
            partIndex === lastTextIndex &&
            parts
              .slice(partIndex + 1)
              .every(
                (remaining) =>
                  remaining.type === "data-intelligent-ui-snapshot",
              );

          if (mode === "view") {
            return (
              <div key={key}>
                <ViewingMessage message={message} partText={part?.text || ""} />
                <Actions
                  className={cn(actionsClassName, {
                    "justify-start": message.role === "assistant",
                    "justify-end": message.role === "user",
                  })}
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
                  {(!hasAcceptedUI || partIndex === lastTextIndex) && (
                    <CopyButton
                      {...copyButtonProps}
                      text={responseText ?? part.text}
                    />
                  )}
                  {message.role === "assistant" &&
                    partIndex === lastTextIndex && (
                      <ModelRoutingStatus metadata={message.metadata} />
                    )}
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
          // `output-error` is terminal. Routing it to the call branch — the
          // loading one — rendered a skeleton that could never resolve
          // (recoupable/app#2052).
          const isTerminal =
            state === "output-available" || state === "output-error";
          return isTerminal
            ? getToolResultComponent(part as ToolUIPart, isOwnStream)
            : getToolCallComponent(part as ToolUIPart, isOwnStream);
        }
      })}
      {responseText !== undefined &&
        lastTextIndex === -1 &&
        mode === "view" && (
          <Actions className={cn(actionsClassName, "justify-start")}>
            {(status === "ready" || status === "error") && (
              <Action
                onClick={() => reload()}
                label="Retry"
                tooltip="Regenerate this response"
              >
                <RefreshCcwIcon className="!w-3 !h-3" />
              </Action>
            )}
            <CopyButton {...copyButtonProps} text={responseText} />
          </Actions>
        )}
      {message.role === "assistant" && lastTextIndex === -1 && (
        <ModelRoutingStatus metadata={message.metadata} />
      )}
    </div>
  );
}
