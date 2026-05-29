import { useMutation } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { deleteChat } from "@/lib/chats/deleteChat";

interface DeleteChatVariables {
  sessionId: string;
  chatId: string;
}

/**
 * Hook to delete a chat by ID using TanStack Query mutation.
 */
export function useDeleteChat() {
  const { getAccessToken } = usePrivy();

  const mutation = useMutation({
    mutationFn: async ({ sessionId, chatId }: DeleteChatVariables) => {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error(
          "Authentication token is missing. Please refresh and try again.",
        );
      }
      return deleteChat(sessionId, chatId, accessToken);
    },
  });

  return {
    deleteChat: mutation.mutateAsync,
    isDeleting: mutation.isPending,
  };
}
