interface ShouldResumeStreamArgs {
  /** Privy session has resolved and the user is signed in. */
  authenticated: boolean;
  /** `chatId` route param — present only on `/sessions/[sessionId]/chats/[chatId]`. */
  routeChatId?: string;
  /** Api-minted chat id from the new-chat bootstrap, once provisioning resolves. */
  workflowChatId?: string;
}

/**
 * Whether `useChat` may re-attach to an in-progress stream on mount.
 *
 * Both conditions guard a request that otherwise 4xxs on every cold load and
 * surfaces as a "please try again" toast (chat#1949 F4a):
 *
 * - **Auth**, because the resume GET beats Privy's session resolution and
 *   would carry no `Authorization` header (401).
 * - **A real chat id**, because the home page mounts `<Chat>` with a locally
 *   generated placeholder UUID that has no row behind it yet (404).
 *
 * `useChat` re-runs its resume effect when this flips, so gating only delays
 * the resume until it can succeed — it does not skip it.
 */
function shouldResumeStream({
  authenticated,
  routeChatId,
  workflowChatId,
}: ShouldResumeStreamArgs): boolean {
  return authenticated && Boolean(routeChatId ?? workflowChatId);
}

export default shouldResumeStream;
