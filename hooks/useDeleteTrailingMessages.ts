import { useMutation } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { deleteTrailingMessages } from "@/lib/messages/deleteTrailingMessages";

interface UseDeleteTrailingMessagesInput {
  onSuccess?: () => void;
}

interface DeleteTrailingMessagesMutationInput {
  chatId: string;
  fromMessageId: string;
}

/**
 * Hook to delete trailing messages for a chat from a specific message and
 * update local chat messages state after mutation completion.
 */
export function useDeleteTrailingMessages({
  onSuccess,
}: UseDeleteTrailingMessagesInput) {
  const { getAccessToken } = usePrivy();

  const mutation = useMutation({
    mutationFn: async ({ chatId, fromMessageId }: DeleteTrailingMessagesMutationInput) => {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Missing access token");
      }

      return deleteTrailingMessages({
        chatId,
        fromMessageId,
        accessToken,
      });
    },
    onSuccess,
  });

  return {
    deleteTrailingMessages: (input: DeleteTrailingMessagesMutationInput) =>
      mutation.mutateAsync(input),
    isDeletingTrailingMessages: mutation.isPending,
  };
}
