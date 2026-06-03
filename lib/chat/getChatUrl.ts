import { getChatPath } from "@/lib/chat/getChatPath";

export function getChatUrl(sessionId: string, chatId: string): string {
  return `https://chat.recoupable.com${getChatPath(sessionId, chatId)}`;
}
