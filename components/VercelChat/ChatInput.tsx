"use client";

import cn from "classnames";
import { useVercelChatContext } from "@/providers/VercelChatProvider";
import AttachmentsPreview from "./AttachmentsPreview";
import PureAttachmentsButton from "./PureAttachmentsButton";
import ChatComposer from "./ChatComposer";
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
  const hasContent = input.trim() !== "" || textAttachments.length > 0;
  const isSendDisabled =
    !isGeneratingResponse &&
    (!hasContent ||
      isDisabled ||
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
        {workspaceStatus !== "ready" && (
          <div className="mb-2 flex justify-end">
            <WorkspaceStatusIndicator
              status={workspaceStatus}
              onRetry={onRetryWorkspace}
            />
          </div>
        )}
        <ChatComposer
          value={typeof input === "string" ? input : ""}
          onChange={setInput}
          onSubmit={handleSend}
          disabled={isDisabled || hasPendingUploads}
          sendDisabled={isSendDisabled}
          status={status}
          submitLabel={isGeneratingResponse ? "Stop response" : "Send message"}
          tools={
            <>
              <PureAttachmentsButton />
            </>
          }
        />
      </div>
    </div>
  );
}

export default ChatInput;
