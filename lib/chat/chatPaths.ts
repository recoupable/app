const SESSION_CHAT_PATH = /^\/sessions\/[^/]+\/chats\/[^/]+/;

export function getChatPath(sessionId: string, chatId: string): string {
  return `/sessions/${sessionId}/chats/${chatId}`;
}

export function getChatUrl(sessionId: string, chatId: string): string {
  return `https://chat.recoupable.com${getChatPath(sessionId, chatId)}`;
}

/** True when the user is on an existing chat room (not `/` or `/chat` bootstrap). */
export function isActiveChatRoomPath(
  pathname: string | null | undefined,
): boolean {
  if (!pathname) return false;
  if (pathname.startsWith("/chat/")) return true;
  return SESSION_CHAT_PATH.test(pathname);
}
