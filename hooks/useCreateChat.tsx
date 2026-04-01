import { useEffect } from "react";
import {
  Conversation,
  CreateChatRequest,
  CreateChatResponse,
} from "@/types/Chat";
import type { ArtistAgent } from "@/lib/supabase/getArtistAgents";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { useConversationsProvider } from "@/providers/ConversationsProvider";
import { useAccessToken } from "@/hooks/useAccessToken";
import { NEW_API_BASE_URL } from "@/lib/consts";

const useCreateChat = ({
  isOptimisticChatItem,
  chatRoom,
  setDisplayName,
}: {
  isOptimisticChatItem: boolean;
  chatRoom: Conversation | ArtistAgent;
  setDisplayName: (displayName: string) => void;
}) => {
  const { selectedArtist } = useArtistProvider();
  const { refetchConversations } = useConversationsProvider();
  const accessToken = useAccessToken();

  useEffect(() => {
    if (!isOptimisticChatItem || !accessToken) return;

    const createChat = async () => {
      try {
        // Extract first message from optimistic memories
        const firstMessage = (chatRoom as Conversation).memories?.find(
          (memory) => {
            const content = memory?.content as {
              optimistic?: boolean;
              parts?: { text: string }[];
            };
            return (
              content &&
              typeof content === "object" &&
              "optimistic" in content &&
              content.optimistic === true &&
              content.parts?.[0]?.text
            );
          }
        );

        if (!firstMessage) {
          console.error("No first message found in optimistic chat");
          return;
        }

        const messageText = (
          firstMessage.content as {
            parts?: { text: string }[];
          }
        ).parts?.[0]?.text;
        if (!messageText) {
          console.error("No message text found");
          return;
        }

        const requestBody: CreateChatRequest = {
          artistId: selectedArtist?.account_id,
          chatId: (chatRoom as Conversation).id,
          firstMessage: messageText,
        };

        const response = await fetch(`${NEW_API_BASE_URL}/api/chats`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(requestBody),
        });

        const data: CreateChatResponse = await response.json();

        if (data.status === "success" && data.chat) {
          // Update display name with the room topic
          setDisplayName(data.chat.topic || "");

          // Remove optimistic flag from memory and treat it as a normal memory.
          // It will re-enable 3 dots on the chat item.
          await refetchConversations();
        } else {
          console.error("Failed to create chat:", data.error || data.message);
        }
      } catch (error) {
        console.error("Error creating optimistic chat:", error);
      }
    };

    createChat();
  }, [
    isOptimisticChatItem,
    chatRoom,
    selectedArtist?.account_id,
    accessToken,
    setDisplayName,
    refetchConversations,
  ]);
};

export default useCreateChat;
