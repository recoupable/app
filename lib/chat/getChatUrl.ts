import { getChatPath } from "@/lib/chat/getChatPath";
import { APP_BASE_URL } from "@/lib/consts";

export function getChatUrl(sessionId: string, chatId: string): string {
  return `${APP_BASE_URL}${getChatPath(sessionId, chatId)}`;
}
