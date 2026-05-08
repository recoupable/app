import type { Conversation } from "@/types/Chat";

export const getChatRoomId = (chatRoom: Conversation): string => chatRoom.id;
