import type { Conversation } from "@/types/Chat";

export const getChatDisplayInfo = (item: Conversation) => ({
  displayName: item.topic || "Chat Analysis",
});
