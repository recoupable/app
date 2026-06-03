"use client";

import cn from "classnames";
import { Messages } from "./messages";
import ChatInput from "./ChatInput";
import ChatSkeleton from "../Chat/ChatSkeleton";
import ChatGreeting from "../Chat/ChatGreeting";
import useVisibilityDelay from "@/hooks/useVisibilityDelay";
import { useParams } from "next/navigation";
import { useArtistFromRoom } from "@/hooks/useArtistFromRoom";
import {
  VercelChatProvider,
  useVercelChatContext,
} from "@/providers/VercelChatProvider";
import { UIMessage } from "ai";
import { useDropzone } from "@/hooks/useDropzone";
import FileDragOverlay from "./FileDragOverlay";
import { Loader } from "lucide-react";
import { memo } from "react";
import { useOrganization } from "@/providers/OrganizationProvider";
import type { WorkspaceStatus } from "./WorkspaceStatusIndicator";

interface ChatProps {
  id: string;
  /**
   * Session id. Always present from the canonical session-scoped route;
   * absent on the new-chat bootstrap path until provisioning resolves
   * (see `NewChatBootstrap`). Send is gated while `workspaceStatus` is not
   * `ready`, so the workflow transport never fires without it.
   */
  sessionId?: string;
  /**
   * Api-minted chat id from bootstrap, used when `id` is a client
   * placeholder. Becomes the transport/URL target once provisioning
   * resolves; falls back to `id` otherwise.
   */
  workflowChatId?: string;
  /**
   * Workspace (session + sandbox) lifecycle; gates Send and drives the
   * status indicator. Defaults to `ready` for existing chats opened from
   * the canonical route.
   */
  workspaceStatus?: WorkspaceStatus;
  initialMessages?: UIMessage[];
}

export function Chat({
  id,
  sessionId,
  workflowChatId,
  workspaceStatus,
  initialMessages,
}: ChatProps) {
  const { selectedOrgId } = useOrganization();
  const providerKey = `${id}-${selectedOrgId ?? "personal"}`;

  return (
    <VercelChatProvider
      key={providerKey}
      chatId={id}
      sessionId={sessionId}
      workflowChatId={workflowChatId}
      workspaceStatus={workspaceStatus}
      initialMessages={initialMessages}
    >
      <ChatContent id={id} />
    </VercelChatProvider>
  );
}

// Inner component that uses the context
function ChatContentMemoized({
  id,
}: {
  id: string;
}) {
  const { messages, status, isLoading, hasError } = useVercelChatContext();
  const { chatId: routeChatId } = useParams<{ chatId?: string }>();
  useArtistFromRoom(id);
  const { getRootProps, isDragActive } = useDropzone();

  const { isVisible } = useVisibilityDelay({
    shouldBeVisible: messages.length === 0 && status === "ready",
    deps: [messages.length, status],
  });

  if (isLoading) {
    return routeChatId ? (
      <ChatSkeleton />
    ) : (
      <div className="flex size-full items-center justify-center">
        <Loader className="block size-5 text-grey-dark-1 animate-spin" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-dvh">
        <div className="text-red-500 dark:text-red-400">
          Failed to load messages. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "px-4 md:px-0 pb-4 flex flex-col h-full items-center w-full relative",
        {
          "justify-between": messages.length > 0,
        }
      )}
      {...getRootProps()}
    >
      {isDragActive && <FileDragOverlay />}
      <div className="absolute w-full h-6 bg-gradient-to-t from-transparent via-background/80 to-background z-10 top-0"></div>
      {isVisible ? (
        <>
          {/* Spacer to push content to center */}
          <div className="flex-1"></div>

          {/* Centered greeting and chat input */}
          <div className="w-full max-w-3xl mx-auto">
            <ChatGreeting isVisible={isVisible} />
            <div className="mt-1 md:mt-6">
              <ChatInput />
            </div>
          </div>
          {/* Spacer to balance and bottom section */}
          <div className="flex-1" />
        </>
      ) : (
        <>
          <Messages />
          <div className="w-full max-w-3xl mx-auto">
            <ChatInput />
          </div>
        </>
      )}
    </div>
  );
}

const ChatContent = memo(ChatContentMemoized, (prevProps, nextProps) => {
  return prevProps.id === nextProps.id;
});
