import { useMutation } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { useApiOverride } from "@/hooks/useApiOverride";
import { deleteChat } from "@/lib/chats/deleteChat";

/**
 * Hook to delete a chat by ID using TanStack Query mutation.
 */
export function useDeleteChat() {
  const { getAccessToken } = usePrivy();
  const apiOverride = useApiOverride();

  const mutation = useMutation({
    mutationFn: async (roomId: string) => {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Authentication token is missing. Please refresh and try again.");
      }
      return deleteChat(roomId, accessToken, apiOverride ?? undefined);
    },
  });

  return {
    deleteChat: mutation.mutateAsync,
    isDeleting: mutation.isPending,
  };
}
