import { useState, useEffect } from "react";
import { UIMessage } from "ai";
import { usePrivy } from "@privy-io/react-auth";
import { getChatMessages } from "@/lib/messages/getChatMessages";

/**
 * Loads persisted UI messages for a session-scoped chat from recoup-api.
 */
export function useMessageLoader(
  sessionId: string,
  chatId: string | undefined,
  userId: string | undefined,
  setMessages: (messages: UIMessage[]) => void,
) {
  const { getAccessToken } = usePrivy();
  const [isLoading, setIsLoading] = useState(!!chatId);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!chatId) {
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

        const initialMessages = await getChatMessages(
          sessionId,
          chatId,
          accessToken,
        );
        if (initialMessages.length > 0) {
          setMessages(initialMessages);
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
  }, [userId, sessionId, chatId, getAccessToken, setMessages]);

  return {
    isLoading,
    error,
    hasError: !!error,
  };
}
