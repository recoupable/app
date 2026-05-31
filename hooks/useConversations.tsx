import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUserProvider } from "@/providers/UserProvder";
import { useArtistProvider } from "@/providers/ArtistProvider";
import getConversations from "@/lib/getConversations";
import { Conversation } from "@/types/Chat";
import { usePrivy } from "@privy-io/react-auth";

const useConversations = () => {
  const { userData } = useUserProvider();
  const { selectedArtist } = useArtistProvider();
  const queryClient = useQueryClient();
  const { getAccessToken, authenticated } = usePrivy();

  const artistAccountId = selectedArtist?.account_id;

  // Artist id is part of the cache key so switching artists triggers a
  // fresh fetch with the new `?artist_account_id` filter rather than
  // reusing the previous artist's cached list.
  const queryKey = useMemo(
    () => ["conversations", artistAccountId ?? null] as const,
    [artistAccountId],
  );

  const {
    data: fetchedConversations = [],
    isLoading,
    isFetching,
    refetch,
  } = useQuery<Conversation[]>({
    queryKey,
    queryFn: async () => {
      const accessToken = await getAccessToken();
      return getConversations(accessToken as string, artistAccountId);
    },
    enabled: authenticated,
    initialData: [],
  });

  const conversations = fetchedConversations;

  // Optimistic update for creating a new chat. Only fires when both the
  // chat row and its parent session are known — legacy chats (without
  // sessionId) skip the optimistic add and surface on the next refetch.
  const addOptimisticConversation = (
    topic: string,
    chatId: string,
    sessionId: string | undefined,
    message?: string,
  ) => {
    if (!userData) return null;
    if (!sessionId) return null;
    // Skip if this chat is already in the sidebar list — otherwise a
    // message sent from a deep-linked existing chat would render a
    // duplicate row.
    if (fetchedConversations.some((c) => c.id === chatId)) return null;

    const now = new Date().toISOString();

    const tempConversation: Conversation = {
      id: chatId,
      topic,
      sessionId,
      account_id: userData.id,
      memories: [
        {
          id: `${chatId}-m1`,
          content: {
            optimistic: true,
            parts: message ? [{ text: message }] : [],
          },
          room_id: chatId,
          created_at: now,
        },
      ],
      updated_at: now,
    };

    queryClient.setQueryData<Conversation[]>(queryKey, (prev = []) => [
      tempConversation,
      ...prev,
    ]);
    return chatId;
  };

  return {
    addOptimisticConversation,
    refetchConversations: refetch,
    conversations,
    isLoading,
    isFetching,
  };
};

export default useConversations;
