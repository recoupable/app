"use client";

import cn from "classnames";
import { useVercelChatContext } from "@/providers/VercelChatProvider";
import AttachmentsPreview from "./AttachmentsPreview";
import PureAttachmentsButton from "./PureAttachmentsButton";
import { motion } from "framer-motion";
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputToolbar,
  PromptInputTools,
} from "../ai-elements/prompt-input";
import ModelSelect from "@/components/ModelSelect";
import FileMentionsInput from "./FileMentionsInput";
import WorkspaceStatusIndicator from "./WorkspaceStatusIndicator";

export function ChatInput() {
  const {
    hasPendingUploads,
    messages,
    status,
    isLoadingSignedUrls,
    handleSendMessage,
    isGeneratingResponse,
    isStopping,
    workspaceStatus,
    stop,
    setInput,
    input,
    textAttachments,
  } = useVercelChatContext();
  // Allow typing regardless of artist selection
  const isDisabled = false;
  // Block sending until the workspace (session + sandbox) is ready; the
  // input stays typeable so users aren't stuck on a spinner meanwhile.
  const isSendDisabled =
    isDisabled ||
    hasPendingUploads ||
    isLoadingSignedUrls ||
    workspaceStatus !== "ready";

  const handleSend = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Already cancelling — ignore further clicks until the backend
    // round-trip resolves and the SSE watcher closes the stream.
    if (isStopping) return;

    // Allow stop action regardless of input state
    if (isGeneratingResponse) {
      stop();
      return;
    }

    // Only check input requirements for sending new messages
    // Allow sending if there are text attachments even without typed input
    const hasContent = input !== "" || textAttachments.length > 0;
    if (!hasContent || isSendDisabled) return;

    handleSendMessage(event);
  };

  return (
    <div className="relative px-4">
      <div
        className={cn("w-full mx-auto", {
          "absolute bottom-[100%]": messages.length > 0,
        })}
      >
        <AttachmentsPreview />
      </div>
      <motion.div
        className="w-full relative"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="absolute right-3 top-3 z-20">
          <WorkspaceStatusIndicator status={workspaceStatus} />
        </div>
        <PromptInput
          onSubmit={handleSend}
          className={cn(
            "overflow-visible",
            "rounded-2xl border border-border bg-background/70 backdrop-blur",
            "shadow-sm"
          )}
        >
          <FileMentionsInput
            value={typeof input === "string" ? input : ""}
            onChange={setInput}
            disabled={isDisabled || hasPendingUploads}
          />
          <PromptInputToolbar>
            <PromptInputTools>
              <PureAttachmentsButton />
              {/* YouTube connect button removed from ChatInput UI intentionally; preserved for future reuse */}
              <ModelSelect />
            </PromptInputTools>
            <PromptInputSubmit
              disabled={isSendDisabled || isStopping}
              // Override status to "submitted" while we're awaiting the
              // backend stop so the button flips to a spinner immediately
              // instead of holding the streaming square for ~1-2s.
              status={isStopping ? "submitted" : status}
              className={cn(
                "rounded-full hover:scale-105 active:scale-95 transition-all",
                {
                  "cursor-not-allowed opacity-50": isSendDisabled || isStopping,
                }
              )}
            />
          </PromptInputToolbar>
        </PromptInput>
      </motion.div>
    </div>
  );
}

export default ChatInput;
