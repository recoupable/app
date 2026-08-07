interface ShouldResumeStreamArgs {
  /** Privy session has resolved and the user is signed in. */
  authenticated: boolean;
  /** `chatId` route param — present only on `/sessions/[sessionId]/chats/[chatId]`. */
  routeChatId?: string;
}

/**
 * Whether `useChat` may re-attach to an in-progress stream.
 *
 * A resume is only ever for one situation: you navigated back to an existing
 * chat that may still be mid-turn. Both conditions below follow from that, and
 * each was verified against the preview deployment (chat#1949 F4a):
 *
 * - **Auth**, because the resume GET otherwise beats Privy's session
 *   resolution and carries no `Authorization` header (401).
 * - **A route `chatId`**, because that is what distinguishes "an existing chat
 *   I opened" from a new chat. The home page has neither: it mounts `<Chat>`
 *   with a client-generated placeholder UUID that no row backs (404), and the
 *   bootstrap-minted id that replaces it belongs to a chat created seconds ago
 *   with no turn in flight. Resuming that one made `WorkflowChatTransport`'s
 *   `while (!gotFinish)` loop reissue the GET 118 times against a 204.
 *
 * `useMessageLoader` already draws the same line for the same reason — a
 * bootstrap chat has nothing to load.
 *
 * `useChat` re-runs its resume effect when this flips, so gating only delays
 * the resume until it can succeed; it does not skip it.
 */
function shouldResumeStream({
  authenticated,
  routeChatId,
}: ShouldResumeStreamArgs): boolean {
  return authenticated && Boolean(routeChatId);
}

export default shouldResumeStream;
