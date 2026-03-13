import type { Conversation } from "@/types/Chat";
import type { ArtistAgent } from "@/lib/supabase/getArtistAgents";
import capitalize from "@/lib/capitalize";

export const getChatDisplayInfo = (item: Conversation | ArtistAgent) => {
  const isChatRoom = "id" in item;
  const displayName = isChatRoom ? item.topic : capitalize(item.type);

  return {
    displayName: displayName || `${capitalize(isChatRoom ? "Chat" : item.type)} Analysis`,
    isChatRoom,
  };
};
