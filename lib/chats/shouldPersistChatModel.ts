export type PersistedChatModel = { chatId: string; model: string } | null;

/**
 * Decides whether the picker's selected model must be persisted to
 * `chats.model_id` before the next send.
 *
 * The chat-workflow path bills the model it reads from `chats.model_id` at
 * request time, so the selection has to be written before the send fires.
 * We persist when we haven't persisted for this chat yet (covers a new
 * chat's first turn) or when the model changed since the last persist for
 * this chat — and skip the redundant PATCH otherwise.
 *
 * @param last - The {chatId, model} we last persisted, or null if none yet.
 * @param chatId - The chat about to receive the message.
 * @param model - The currently selected model id.
 */
export function shouldPersistChatModel(
  last: PersistedChatModel,
  chatId: string,
  model: string,
): boolean {
  if (!last) return true;
  if (last.chatId !== chatId) return true;
  return last.model !== model;
}
