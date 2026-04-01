import { useState, useEffect } from "react";
import { UIMessage } from "ai";
import getChatMessages from "@/lib/messages/getChatMessages";

/**
 * Hook for loading existing messages from a room
 * @param roomId - The room ID to load messages from (undefined to skip loading)
 * @param userId - The current user ID (messages won't load if user is not authenticated)
 * @param setMessages - Callback function to set the loaded messages
 * @returns Loading state and error information
 */
export function useMessageLoader(
  roomId: string | undefined,
  userId: string | undefined,
  accessToken: string | null,
  apiOverride: string | null,
  setMessages: (messages: UIMessage[]) => void,
) {
  const [isLoading, setIsLoading] = useState(!!roomId);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!roomId) {
      setIsLoading(false);
      return;
    }

    if (!userId) {
      setIsLoading(true);
      return;
    }

    if (!accessToken) {
      return;
    }

    const loadMessages = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const initialMessages = await getChatMessages(
          roomId,
          accessToken,
          apiOverride ?? undefined,
        );
        if (initialMessages.length > 0) {
          setMessages(initialMessages as UIMessage[]);
        }
      } catch (err) {
        console.error("Error loading messages:", err);
        setError(
          err instanceof Error ? err : new Error("Failed to load messages"),
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [userId, roomId, accessToken, apiOverride]);

  return {
    isLoading,
    error,
    hasError: !!error,
  };
}
