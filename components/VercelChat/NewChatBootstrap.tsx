"use client";

import type { UIMessage } from "ai";
import { useState } from "react";
import { useNewChatBootstrap } from "@/hooks/useNewChatBootstrap";
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
  const state = useNewChatBootstrap();
  const [draftInput, setDraftInput] = useState("");

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
