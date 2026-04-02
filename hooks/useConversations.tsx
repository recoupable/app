import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUserProvider } from "@/providers/UserProvder";
import { useArtistProvider } from "@/providers/ArtistProvider";
import getConversations from "@/lib/getConversations";
import { Conversation } from "@/types/Chat";
import useArtistAgents from "./useArtistAgents";
import { ArtistAgent } from "@/lib/supabase/getArtistAgents";
import { usePrivy } from "@privy-io/react-auth";

const useConversations = () => {
  const { userData } = useUserProvider();
  const { selectedArtist, artists } = useArtistProvider();
  const { agents } = useArtistAgents();
  const queryClient = useQueryClient();
  const { getAccessToken, authenticated } = usePrivy();

  // Get artist IDs in the current org/view for filtering
  const orgArtistIds = useMemo(
    () => new Set(artists.map((a) => a.account_id)),
    [artists],
  );

  const queryKey = useMemo(() => ["conversations"] as const, []);

  const {
    data: fetchedConversations = [],
    isLoading,
    isFetching,
    refetch,
  } = useQuery<Conversation[]>({
    queryKey,
    queryFn: async () => {
      const accessToken = await getAccessToken();
      return getConversations(accessToken as string);
    },
    enabled: authenticated,
    initialData: [],
  });

  const combinedConversations = useMemo<
    Array<Conversation | ArtistAgent>
  >(() => {
    return [...fetchedConversations, ...agents];
  }, [fetchedConversations, agents]);

  const conversations = useMemo(() => {
    // If artist selected, filter to only that artist's conversations
    if (selectedArtist) {
      return combinedConversations.filter(
        (item: Conversation | ArtistAgent) =>
          "artist_id" in item && item.artist_id === selectedArtist.account_id,
      );
    }

    // No artist selected - filter to artists in the current org view
    if (orgArtistIds.size > 0) {
      return combinedConversations.filter(
        (item: Conversation | ArtistAgent) =>
          "artist_id" in item && orgArtistIds.has(item.artist_id),
      );
    }

    // Fallback: no artists in org (shouldn't happen normally)
    return combinedConversations;
  }, [selectedArtist, combinedConversations, orgArtistIds]);

  // Optimistic update helpers for creating a new chat room
  const addOptimisticConversation = (
    topic: string,
    chatId: string,
    message?: string,
  ) => {
    if (!userData || !selectedArtist?.account_id) return null;
    // Avoid adding an optimistic conversation when a chat id already exists in the URL
    const hasChatIdInUrl =
      typeof window !== "undefined" &&
      /\/chat\/[^\/]+/.test(window.location.pathname);
    if (hasChatIdInUrl) return null;

    const now = new Date().toISOString();

    const tempConversation: Conversation = {
      id: chatId,
      topic,
      account_id: userData.id,
      artist_id: selectedArtist.account_id,
      // Include one memory so it shows up in RecentChats filter
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
      room_reports: [],
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
