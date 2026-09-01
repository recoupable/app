export type ComposerSubmitAction = "send" | "prompt-login" | "disabled";

interface GetComposerSubmitActionParams {
  /** Privy has finished initializing — login() must never fire before this. */
  authReady: boolean;
  authenticated: boolean;
  /** Typed input or text attachments present. */
  hasContent: boolean;
  /** Pending uploads, signed-url loading, or workspace not ready. */
  isSendBlocked: boolean;
}

/**
 * Decides what a composer send attempt (button click or Enter) should do.
 * Auth is checked before send blockers because the workspace never
 * provisions for anonymous visitors — without the auth branch a signed-out
 * visitor who dismissed the login modal hits a permanently disabled Send
 * with no way forward (chat#1902 C4). "prompt-login" reopens the Privy
 * modal; the draft stays in component state through the auth flow.
 */
export function getComposerSubmitAction({
  authReady,
  authenticated,
  hasContent,
  isSendBlocked,
}: GetComposerSubmitActionParams): ComposerSubmitAction {
  if (!authReady) return "disabled";
  if (!hasContent) return "disabled";
  if (!authenticated) return "prompt-login";
  if (isSendBlocked) return "disabled";
  return "send";
}
