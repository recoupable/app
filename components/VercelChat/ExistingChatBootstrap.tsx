"use client";

import { useExistingChatBootstrap } from "@/hooks/useExistingChatBootstrap";
import { Chat } from "@/components/VercelChat/chat";
import ChatSkeleton from "../Chat/ChatSkeleton";

interface ExistingChatBootstrapProps {
  roomId: string;
}

/**
 * Resolves an existing chat's `sessionId` (via `useExistingChatBootstrap`)
 * before mounting `<Chat>` on the workflow path. Mirrors
 * `NewChatBootstrap`, but for `/chat/[roomId]` pages opened from history
 * rather than a freshly provisioned session (recoupable/chat#1747).
 */
export default function ExistingChatBootstrap({ roomId }: ExistingChatBootstrapProps) {
  const state = useExistingChatBootstrap(roomId);

  if (state.status === "ready") {
    return <Chat id={state.chatId} sessionId={state.sessionId} />;
  }

  if (state.status === "not_found") {
    return (
      <div className="flex items-center justify-center h-dvh">
        <div className="text-grey-dark-1">This chat isn’t available.</div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex items-center justify-center h-dvh">
        <div className="text-red-500 dark:text-red-400">{state.message}</div>
      </div>
    );
  }

  return <ChatSkeleton />;
}
