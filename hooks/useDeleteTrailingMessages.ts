import { useMutation } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { deleteTrailingMessages } from "@/lib/messages/deleteTrailingMessages";

interface UseDeleteTrailingMessagesInput {
  onSuccess?: () => void;
}

interface DeleteTrailingMessagesMutationInput {
  chatId: string;
  fromMessageId: string;
  isCurrent?: () => boolean;
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
    retry: false,
    mutationFn: async ({
      chatId,
      fromMessageId,
      isCurrent,
    }: DeleteTrailingMessagesMutationInput) => {
      if (isCurrent?.() === false) return;
      const accessToken = await getAccessToken();
      if (isCurrent?.() === false) return;
      if (!accessToken) {
        throw new Error("Missing access token");
      }

      return deleteTrailingMessages({
        chatId,
        fromMessageId,
        accessToken,
      });
    },
    onSuccess: (_data, input) => {
      if (input.isCurrent?.() !== false) onSuccess?.();
    },
  });

  return {
    deleteTrailingMessages: (input: DeleteTrailingMessagesMutationInput) =>
      mutation.mutateAsync(input),
    isDeletingTrailingMessages: mutation.isPending,
  };
}
