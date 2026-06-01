import { useEffect, useState } from "react";
import { useVercelChatContext } from "@/providers/VercelChatProvider";
import { useConversationsProvider } from "@/providers/ConversationsProvider";
import { CreateArtistResult } from "@/types/createArtistResult";
import copyMessages from "@/lib/messages/copyMessages";
import { getChatPath } from "@/lib/chat/chatPaths";
import { usePrivy } from "@privy-io/react-auth";

/**
 * Hook for managing the create artist tool result
 * Handles refreshing artists, copying messages, and navigation
 */
export function useCreateArtistTool(result: CreateArtistResult) {
  const { status, id, sessionId } = useVercelChatContext();
  const { refetchConversations } = useConversationsProvider();
  const { getAccessToken } = usePrivy();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only process when streaming is finished
    const isFinishedStreaming = status === "ready";

    // Skip if no artist data or already processing
    const shouldSkip =
      !result.artist ||
      !result.artist.account_id ||
      isProcessing ||
      !isFinishedStreaming;
    if (shouldSkip) {
      return;
    }

    const processCreateArtistResult = async () => {
      try {
        setIsProcessing(true);

        const accessToken = await getAccessToken();
        if (!accessToken) return;

        // Step 1: Check if we need to copy messages and redirect
        const needsRedirect = id !== result.newRoomId && !!result.newRoomId;

        if (needsRedirect) {
          // Copy messages from current room to the newly created room
          const success = await copyMessages(
            id as string,
            result.newRoomId as string,
            accessToken,
          );

          // Refresh conversations to show the new chat
          await refetchConversations();

          if (success) {
            // Update the URL to point to the new conversation
            window.history.replaceState(
              {},
              "",
              getChatPath(sessionId, result.newRoomId),
            );
            setIsSuccess(true);
          } else {
            console.error("Failed to copy messages");
            setError("Failed to copy messages to the new artist");
          }
        } else {
          setIsSuccess(true);
        }
      } catch (error) {
        console.error("Error in useCreateArtistTool:", error);
        setError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        setIsProcessing(false);
      }
    };

    processCreateArtistResult();
  }, [
    status,
    result,
    id,
    isProcessing,
    refetchConversations,
    getAccessToken,
    sessionId,
  ]);

  return {
    isProcessing,
    isSuccess,
    error,
  };
}

export default useCreateArtistTool;
