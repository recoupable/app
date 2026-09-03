"use client";

import type { UIMessage } from "ai";
import { useRef } from "react";
import { useNewChatBootstrap } from "@/hooks/useNewChatBootstrap";
import { Chat } from "@/components/VercelChat/chat";
import type { WorkspaceStatus } from "@/components/VercelChat/WorkspaceStatusIndicator";
import { generateUUID } from "@/lib/generateUUID";

interface NewChatBootstrapProps {
  initialMessages?: UIMessage[];
}

/**
 * Thin renderer over `useNewChatBootstrap`. Mounted by `app/page.tsx`
 * (via HomePage) and `app/chat/page.tsx`. Renders `<Chat>` immediately
 * with a typeable input and provisions a recoup-api session + sandbox in
 * parallel — instead of blocking the whole view on a spinner. Send stays
 * disabled (via `workspaceStatus`, surfaced as the status dot) until the
 * api-minted `sessionId` + `chatId` land, so the workflow transport never
 * fires without the ids its validator requires (recoupable/chat#1747, #1767).
 *
 * Auto-login is handled app-wide by `<UserAutoLogin />` in `UserProvider`
 * (chat#1761) — do not call `useAutoLogin()` here.
 */
export default function NewChatBootstrap({
  initialMessages,
}: NewChatBootstrapProps) {
  const state = useNewChatBootstrap();
  // Stable client id so the <Chat> instance (and anything typed into it)
  // survives the preparing → ready transition. The api-minted chat id
  // arrives via `workflowChatId` and takes over as the transport/URL
  // target on the first send.
  const placeholderChatId = useRef(generateUUID()).current;

  // Provisioning failures surface as the red "off" dot (input stays
  // visible, Send disabled) rather than replacing the whole view.
  const workspaceStatus: WorkspaceStatus =
    state.status === "ready"
      ? "ready"
      : state.status === "error"
        ? "off"
        : "provisioning";

  // The ids are handed down as soon as the session is minted, not when the
  // sandbox finishes: they are real and routable for the whole ~17s the
  // sandbox takes, so the chat can show its own URL and the message the person
  // sent. Sending stays gated on `workspaceStatus` (app#2052).
  const ids =
    state.status === "ready" || state.status === "session-ready"
      ? { sessionId: state.sessionId, chatId: state.chatId }
      : undefined;

  return (
    <div className="relative flex size-full flex-col items-center">
      <Chat
        id={placeholderChatId}
        sessionId={ids?.sessionId}
        workflowChatId={ids?.chatId}
        workspaceStatus={workspaceStatus}
        initialMessages={initialMessages}
      />
    </div>
  );
}
