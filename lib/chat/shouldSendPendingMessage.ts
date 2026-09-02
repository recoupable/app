interface ShouldSendPendingMessageParams {
  /**
   * Text is waiting on the workspace: a `?q=` deep link prefilled the input, or
   * Send was pressed while provisioning (recoupable/app#2052). Same situation,
   * same gate.
   */
  hasPendingMessage: boolean;
  /** useChat transport status — only "ready" may send. */
  status: string;
  messagesLength: number;
  userId?: string;
  authenticated: boolean;
  /**
   * Api-minted session id from the new-chat bootstrap (or the canonical
   * route). Absent while provisioning — sending then would POST /api/chat
   * without a sessionId and 400 (chat#1847): the ?q= auto-send used to
   * race the bootstrap and lose, while the manual Send button was
   * correctly gated on the same condition.
   */
  sessionId?: string;
}

/**
 * Decides whether a pending message may auto-send — the ?q= deep link, or a
 * Send pressed before the workspace was ready.
 * Mirrors the manual-send gates (auth + transport ready + nothing sent
 * yet) and additionally requires the provisioned sessionId — the effect
 * re-runs when it lands, so the message queues rather than failing.
 */
export function shouldSendPendingMessage({
  hasPendingMessage,
  status,
  messagesLength,
  userId,
  authenticated,
  sessionId,
}: ShouldSendPendingMessageParams): boolean {
  if (!hasPendingMessage) return false;
  if (status !== "ready") return false;
  if (messagesLength > 1) return false;
  if (!userId || !authenticated) return false;
  if (!sessionId) return false;
  return true;
}
