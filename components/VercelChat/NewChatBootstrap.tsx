"use client";

import type { UIMessage } from "ai";
import { Loader } from "lucide-react";
import { useNewChatBootstrap } from "@/hooks/useNewChatBootstrap";
import { useAutoLogin } from "@/hooks/useAutoLogin";
import { Chat } from "@/components/VercelChat/chat";

interface NewChatBootstrapProps {
  initialMessages?: UIMessage[];
}

/**
 * Thin renderer over `useNewChatBootstrap`. Mounted by the home route
 * (`/`) and `app/chat/page.tsx`; provisions a recoup-api session +
 * sandbox before mounting `<Chat>` so the workflow transport
 * (`/api/chat/workflow`) has the `sessionId` + `chatId` its validator
 * requires (recoupable/chat#1747).
 *
 * `useAutoLogin` prompts sign-in for anonymous visitors — the bootstrap
 * waits on `authenticated`, so without it a logged-out landing would
 * hang on the spinner.
 */
export default function NewChatBootstrap({
  initialMessages,
}: NewChatBootstrapProps) {
  useAutoLogin();
  const state = useNewChatBootstrap();

  if (state.status === "ready") {
    return (
      <Chat
        id={state.chatId}
        sessionId={state.sessionId}
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
    <div className="flex size-full items-center justify-center">
      <Loader className="size-5 animate-spin text-muted-foreground" />
    </div>
  );
}
