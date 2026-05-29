import { useState, useEffect } from "react";
import { UIMessage } from "ai";
import { usePrivy } from "@privy-io/react-auth";
import getChatMessages from "@/lib/messages/getChatMessages";

/**
 * Hook for loading a chat's persisted history from `chat_messages`
 * (via recoup-api's session-chat endpoint).
 * @param sessionId - Parent session id (undefined to skip loading)
 * @param roomId - The chat/room ID to load messages from (undefined to skip loading)
 * @param userId - The current user ID (messages won't load if user is not authenticated)
 * @param setMessages - Callback function to set the loaded messages
 * @returns Loading state and error information
 */
export function useMessageLoader(
  sessionId: string | undefined,
  roomId: string | undefined,
  userId: string | undefined,
  setMessages: (messages: UIMessage[]) => void,
) {
  const { getAccessToken } = usePrivy();
  const [isLoading, setIsLoading] = useState(!!roomId && !!sessionId);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!roomId || !sessionId) {
      setIsLoading(false);
      return;
    }

    if (!userId) {
      setIsLoading(true);
      return;
    }

    const loadMessages = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const accessToken = await getAccessToken();
        if (!accessToken) return;

        const initialMessages = await getChatMessages(sessionId, roomId, accessToken);
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
  }, [userId, sessionId, roomId, getAccessToken, setMessages]);

  return {
    isLoading,
    error,
    hasError: !!error,
  };
}
