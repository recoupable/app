"use client";

import cn from "classnames";
import { useVercelChatContext } from "@/providers/VercelChatProvider";
import AttachmentsPreview from "./AttachmentsPreview";
import PureAttachmentsButton from "./PureAttachmentsButton";
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputToolbar,
  PromptInputTools,
} from "../ai-elements/prompt-input";
import ModelSelect from "@/components/ModelSelect";
import FileMentionsInput from "./FileMentionsInput";
import WorkspaceStatusIndicator from "./WorkspaceStatusIndicator";

export function ChatInput({
  onRetryWorkspace,
}: { onRetryWorkspace?: () => void } = {}) {
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
  } = useVercelChatContext();
  // Allow typing regardless of artist selection
  const isDisabled = false;
  // A Send during provisioning goes through: the transport holds the request
  // until the sandbox is ready (app#2052). Only blockers that do not clear on
  // their own disable the button.
  const isSendDisabled =
    !isGeneratingResponse &&
    (isDisabled ||
      hasPendingUploads ||
      isLoadingSignedUrls ||
      workspaceStatus === "off");

  const handleSend = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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
      <div className="w-full relative">
        <div className="mb-2 flex justify-end">
          <WorkspaceStatusIndicator
            status={workspaceStatus}
            onRetry={onRetryWorkspace}
          />
        </div>
        <PromptInput
          onSubmit={handleSend}
          className={cn(
            "overflow-visible",
            "rounded-[20px] border-0 bg-card",
            "shadow-[0_0_0_1px_var(--input),0_6px_24px_var(--surface-shadow)] focus-within:ring-2 focus-within:ring-ring",
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
              aria-label={
                isGeneratingResponse ? "Stop response" : "Send message"
              }
              disabled={isSendDisabled}
              status={status}
              className={cn(
                "size-11 rounded-full bg-brand-lime text-brand-on-lime hover:bg-brand-lime-hover transition-colors",
                {
                  "cursor-not-allowed opacity-50": isSendDisabled,
                },
              )}
            />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
}

export default ChatInput;
