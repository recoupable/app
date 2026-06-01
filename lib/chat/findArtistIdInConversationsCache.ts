import type { QueryClient } from "@tanstack/react-query";
import type { Conversation } from "@/types/Chat";

/**
 * Looks up a chat's `artist_id` from any cached conversations query.
 * Used for legacy `/chat/{id}` deep links that lack a `sessionId` in the URL.
 */
export function findArtistIdInConversationsCache(
  queryClient: QueryClient,
  chatId: string,
): string | undefined {
  const entries = queryClient.getQueriesData<Conversation[]>({
    queryKey: ["conversations"],
  });

  for (const [, conversations] of entries) {
    const match = conversations?.find((conversation) => conversation.id === chatId);
    if (match?.artist_id) {
      return match.artist_id;
    }
  }

  return undefined;
}
