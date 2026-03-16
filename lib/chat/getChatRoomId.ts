import type { Conversation } from "@/types/Chat";
import type { ArtistAgent } from "@/lib/supabase/getArtistAgents";

export const getChatRoomId = (chatRoom: Conversation | ArtistAgent): string =>
  "id" in chatRoom ? chatRoom.id : chatRoom.agentId;
