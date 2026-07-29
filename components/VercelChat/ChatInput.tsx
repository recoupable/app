"use client";

import cn from "classnames";
import { usePrivy } from "@privy-io/react-auth";
import { useVercelChatContext } from "@/providers/VercelChatProvider";
import { getComposerSubmitAction } from "@/lib/chat/getComposerSubmitAction";
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
  } = useVercelChatContext();
  const { ready: authReady, authenticated, login } = usePrivy();
  // Allow typing regardless of artist selection
  const isDisabled = false;
  // Block sending until the workspace (session + sandbox) is ready; the
  // input stays typeable so users aren't stuck on a spinner meanwhile.
  const isSendBlocked =
    isDisabled ||
    hasPendingUploads ||
    isLoadingSignedUrls ||
    workspaceStatus !== "ready";
  // Allow sending if there are text attachments even without typed input
  const hasContent = input !== "" || textAttachments.length > 0;
  const submitAction = getComposerSubmitAction({
    authReady,
    authenticated,
    hasContent,
    isSendBlocked,
  });
  // The workspace never provisions for signed-out visitors, so Send must
  // stay clickable for them once they have a draft: the attempt reopens
  // the Privy login modal instead of dead-ending (chat#1902 C4).
  const isSendDisabled =
    submitAction === "prompt-login" ? false : isSendBlocked;

  const handleSend = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Allow stop action regardless of input state
    if (isGeneratingResponse) {
      stop();
      return;
    }

    // Signed-out send attempt: reopen the login modal. The draft lives in
    // `input` state above this overlay, so it survives the auth flow.
    if (submitAction === "prompt-login") {
      login();
      return;
    }

    if (submitAction !== "send") return;

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
            "shadow-sm",
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
              aria-label={
                isGeneratingResponse
                  ? "Stop response"
                  : submitAction === "prompt-login"
                    ? "Sign in to send"
                    : "Send message"
              }
              status={status}
              className={cn(
                "rounded-full hover:scale-105 active:scale-95 transition-all",
                {
                  "cursor-not-allowed opacity-50": isSendDisabled,
                },
              )}
            />
          </PromptInputToolbar>
        </PromptInput>
      </motion.div>
    </div>
  );
}

export default ChatInput;
