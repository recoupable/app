export function getChatPath(sessionId: string, chatId: string): string {
  return `/sessions/${sessionId}/chats/${chatId}`;
}
