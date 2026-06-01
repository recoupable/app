"use client";

import type { UIMessage } from "ai";
import { useRef } from "react";
import {
  isNewChatBootstrapPreparing,
  useNewChatBootstrap,
} from "@/hooks/useNewChatBootstrap";
import { Chat } from "@/components/VercelChat/chat";
import { generateUUID } from "@/lib/generateUUID";

interface NewChatBootstrapProps {
  initialMessages?: UIMessage[];
}

/**
 * Thin renderer over `useNewChatBootstrap`. Mounted by
 * `app/page.tsx` (via HomePage) and `app/chat/page.tsx`; provisions
 * a recoup-api session + sandbox in parallel while `<Chat>` is visible.
 * Send stays disabled until bootstrap resolves so the workflow transport
 * has the api-minted `sessionId` + `chatId` (recoupable/chat#1747).
 *
 * Auto-login is handled app-wide by `<UserAutoLogin />` in `UserProvider`
 * (chat#1761) — do not call `useAutoLogin()` here.
 */
export default function NewChatBootstrap({
  initialMessages,
}: NewChatBootstrapProps) {
  const state = useNewChatBootstrap();
  const placeholderChatId = useRef(generateUUID()).current;

  const isBootstrapPreparing = isNewChatBootstrapPreparing(state);

  if (state.status === "error") {
    return (
      <div className="flex size-full items-center justify-center text-sm text-red-600">
        {state.message}
      </div>
    );
  }

  return (
    <Chat
      id={placeholderChatId}
      sessionId={state.status === "ready" ? state.sessionId : undefined}
      workflowChatId={state.status === "ready" ? state.chatId : undefined}
      isBootstrapPreparing={isBootstrapPreparing}
      initialMessages={initialMessages}
    />
  );
}
