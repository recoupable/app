"use client";

import cn from "classnames";
import { useVercelChatContext } from "@/providers/VercelChatProvider";
import AttachmentsPreview from "./AttachmentsPreview";
import PureAttachmentsButton from "./PureAttachmentsButton";
import ChatComposer from "./ChatComposer";
import WorkspaceStatusIndicator from "./WorkspaceStatusIndicator";

const recoveryActionClassName =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-2 underline underline-offset-4 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

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
    attachments,
    sendError,
    failedDraftPreview,
    hasFailedSubmission,
    retrySendMessage,
    discardFailedSubmission,
    stopState,
  } = useVercelChatContext();
  // Allow typing regardless of artist selection
  const isDisabled = false;
  // A Send during provisioning goes through: the transport holds the request
  // until the sandbox is ready (app#2052). Only blockers that do not clear on
  // their own disable the button.
  const hasContent =
    input.trim() !== "" || textAttachments.length > 0 || attachments.length > 0;
  const isSendDisabled =
    !isGeneratingResponse &&
    (!hasContent ||
      isDisabled ||
      hasPendingUploads ||
      isLoadingSignedUrls ||
      workspaceStatus === "off" ||
      stopState?.status === "error" ||
      !!hasFailedSubmission);

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
        {(sendError || stopState?.message) && (
          <div
            className="mb-2 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-sm"
            role={
              sendError || stopState?.status === "error" ? "alert" : "status"
            }
          >
            <span className="min-w-0 basis-full">
              {stopState?.message || sendError}
              {sendError &&
                (stopState?.status === "stopped" ||
                  stopState?.status === "inactive") && (
                  <span className="block">{sendError}</span>
                )}
              {sendError && failedDraftPreview && (
                <span className="block truncate text-muted-foreground">
                  {failedDraftPreview}
                </span>
              )}
            </span>
            {stopState?.status === "error" ? (
              <button
                type="button"
                className={recoveryActionClassName}
                onClick={() => void stop()}
              >
                Retry Stop
              </button>
            ) : (
              sendError &&
              !isGeneratingResponse && (
                <button
                  type="button"
                  className={recoveryActionClassName}
                  onClick={() =>
                    void retrySendMessage?.({
                      preventDefault() {},
                    } as React.FormEvent<HTMLFormElement>)
                  }
                >
                  Retry
                </button>
              )
            )}
            {sendError &&
              !isGeneratingResponse &&
              stopState?.status !== "error" && (
                <button
                  type="button"
                  className={recoveryActionClassName}
                  onClick={discardFailedSubmission}
                >
                  Discard failed message
                </button>
              )}
          </div>
        )}
        <ChatComposer
          value={typeof input === "string" ? input : ""}
          onChange={setInput}
          onSubmit={handleSend}
          disabled={isDisabled || hasPendingUploads}
          sendDisabled={isSendDisabled}
          status={
            isGeneratingResponse
              ? status === "streaming"
                ? "streaming"
                : "submitted"
              : "ready"
          }
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
