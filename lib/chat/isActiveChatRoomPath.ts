const SESSION_CHAT_PATH = /^\/sessions\/[^/]+\/chats\/[^/]+/;

/** True when the user is on an existing chat room (not `/` or `/chat` bootstrap). */
export function isActiveChatRoomPath(
  pathname: string | null | undefined,
): boolean {
  if (!pathname) return false;
  return SESSION_CHAT_PATH.test(pathname);
}
