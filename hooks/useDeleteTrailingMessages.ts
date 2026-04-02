import { useMutation } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { UIMessage } from "ai";
import { deleteTrailingMessages as deleteTrailingMessagesApi } from "@/lib/messages/deleteTrailingMessages";
import { useVercelChatContext } from "@/providers/VercelChatProvider";

interface UseDeleteTrailingMessagesInput {
  message: UIMessage;
  draftContent: string;
  onSuccess?: () => void;
}

/**
 * Hook to delete trailing messages for a chat from a specific message and
 * update local chat messages state after mutation completion.
 */
export function useDeleteTrailingMessages({
  message,
  draftContent,
  onSuccess,
}: UseDeleteTrailingMessagesInput) {
  const { id, setMessages } = useVercelChatContext();
  const { getAccessToken } = usePrivy();

  const mutation = useMutation({
    mutationFn: async () => {
      const accessToken = await getAccessToken();
      if (!id || !accessToken) {
        return false;
      }

      return deleteTrailingMessagesApi({
        chatId: id,
        fromMessageId: message.id,
        accessToken,
      });
    },
    onSettled: () => {
      // @ts-expect-error todo: support UIMessage in setMessages
      setMessages((messages) => {
        const index = messages.findIndex((m) => m.id === message.id);

        if (index !== -1) {
          const updatedMessage = {
            ...message,
            content: draftContent,
            parts: [{ type: "text", text: draftContent }],
          };

          return [...messages.slice(0, index), updatedMessage];
        }

        return messages;
      });
    },
    onSuccess: (deleted) => {
      if (deleted) {
        onSuccess?.();
      }
    },
  });

  return {
    deleteTrailingMessages: () => mutation.mutateAsync(),
    isDeletingTrailingMessages: mutation.isPending,
  };
}
