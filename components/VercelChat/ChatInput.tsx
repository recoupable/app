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
    workspaceStatus,
    stop,
    setInput,
    input,
    textAttachments,
    sendArmed,
    armSend,
  } = useVercelChatContext();
  // Allow typing regardless of artist selection
  const isDisabled = false;
  const workspaceReady = workspaceStatus === "ready";
  // Only the blockers that do not clear on their own disable the button.
  const isSendDisabled = isDisabled || hasPendingUploads || isLoadingSignedUrls;

  const handleSend = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Allow stop action regardless of input state
    if (isGeneratingResponse) {
      stop();
      return;
    }

    // Allow sending if there are text attachments even without typed input
    const hasContent = input !== "" || textAttachments.length > 0;
    if (!hasContent || isSendDisabled) return;

    // The input IS the queue — leave the text where it is and let the
    // provisioning-gated auto-fire in usePendingMessageAutoSend send it, the
    // same path the ?q= deep link already uses. An edit made while waiting
    // therefore sends the edited text (app#2052).
    if (!workspaceReady) {
      armSend();
      return;
    }

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
        {sendArmed && input && (
          <div
            role="status"
            className="absolute bottom-[100%] left-0 mb-2 flex w-full items-center gap-2 px-1 text-xs text-muted-foreground"
          >
            <span className="inline-block size-1.5 shrink-0 animate-pulse rounded-full bg-muted-foreground" />
            <span className="truncate">
              Sending as soon as your workspace is ready
            </span>
          </div>
        )}
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
              disabled={isSendDisabled}
              status={status}
              className={cn(
                "rounded-full hover:scale-105 active:scale-95 transition-all",
                {
                  "cursor-not-allowed opacity-50": isSendDisabled,
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
