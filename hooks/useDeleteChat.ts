import { useMutation } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { archiveSession } from "@/lib/sessions/archiveSession";

interface DeleteChatVariables {
  sessionId: string;
}

/**
 * Hook backing the sidebar's "Delete chat" action. The action archives
 * the owning session rather than deleting the chat row directly:
 * archived sessions are filtered out of `GET /api/chats` by the api,
 * so the chat disappears from the sidebar, and archive also triggers
 * the existing sandbox-teardown lifecycle on the api side. The whole
 * thing stays reversible (admin can unarchive). See
 * `lib/sessions/archiveSession.ts` for the wire call.
 */
export function useDeleteChat() {
  const { getAccessToken } = usePrivy();

  const mutation = useMutation({
    mutationFn: async ({ sessionId }: DeleteChatVariables) => {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error(
          "Authentication token is missing. Please refresh and try again.",
        );
      }
      return archiveSession(sessionId, accessToken);
    },
  });

  return {
    deleteChat: mutation.mutateAsync,
    isDeleting: mutation.isPending,
  };
}
