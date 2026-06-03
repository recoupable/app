"use client";

import type { UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import { useChatSessionProvision } from "@/providers/ChatSessionProvisionProvider";
import { Chat } from "@/components/VercelChat/chat";
import NewChatPreparingShell from "@/components/VercelChat/NewChatPreparingShell";

interface NewChatBootstrapProps {
  initialMessages?: UIMessage[];
}

/**
 * New-chat entry for `/` and `/chat`. Provisioning runs at app level
 * (`ChatSessionProvisionProvider`); while ids are pending this shows a
 * typeable input instead of a full-screen spinner. `<Chat>` mounts only
 * when `sessionId` + `chatId` are ready (#1765).
 */
export default function NewChatBootstrap({
  initialMessages,
}: NewChatBootstrapProps) {
  const { state, consumedChatId, resetProvision } = useChatSessionProvision();
  const [draftInput, setDraftInput] = useState("");
  const staleResetStartedRef = useRef(false);

  // Returning to `/` or `/chat` after a prior first-send still has a
  // successful mutation in the root provider — reset once on mount so
  // we mint a fresh session instead of appending to the old chat.
  useEffect(() => {
    if (staleResetStartedRef.current) return;
    if (
      state.status === "ready" &&
      consumedChatId !== null &&
      state.chatId === consumedChatId
    ) {
      staleResetStartedRef.current = true;
      resetProvision();
    }
  }, [state, consumedChatId, resetProvision]);

  useEffect(() => {
    if (state.status === "bootstrapping" || state.status === "idle") {
      setDraftInput("");
      staleResetStartedRef.current = false;
    }
  }, [state.status]);

  if (state.status === "ready") {
    return (
      <Chat
        id={state.chatId}
        sessionId={state.sessionId}
        initialInput={draftInput}
        initialMessages={initialMessages}
      />
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex size-full items-center justify-center text-sm text-red-600">
        {state.message}
      </div>
    );
  }

  return (
    <NewChatPreparingShell input={draftInput} onInputChange={setDraftInput} />
  );
}
