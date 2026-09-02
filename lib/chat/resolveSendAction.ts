export type SendAction = "stop" | "send" | "queue" | "ignore";

export interface ResolveSendActionInput {
  /** A run is streaming, so the button is a stop button. */
  isGeneratingResponse: boolean;
  /** Typed text or a text attachment is present. */
  hasContent: boolean;
  hasPendingUploads: boolean;
  isLoadingSignedUrls: boolean;
  /** The session's sandbox has finished provisioning. */
  workspaceReady: boolean;
}

/**
 * What pressing send should do, given the composer's state.
 *
 * `"queue"` exists because the workspace is the one blocker that always clears
 * on its own. The composer used to refuse the send outright until the sandbox
 * finished provisioning, so the person had to watch for the button to come
 * alive — a slow, attention-demanding first interaction and a high-churn one,
 * since an interested user types, cannot send, and abandons the sandbox having
 * never sent a message (app#2052).
 *
 * Uploads are deliberately NOT queued: they can fail, so a message that
 * depends on one has nothing to guarantee.
 *
 * @param input - The composer's current state.
 * @returns The action the caller should take.
 */
export function resolveSendAction({
  isGeneratingResponse,
  hasContent,
  hasPendingUploads,
  isLoadingSignedUrls,
  workspaceReady,
}: ResolveSendActionInput): SendAction {
  if (isGeneratingResponse) return "stop";
  if (!hasContent) return "ignore";
  if (hasPendingUploads || isLoadingSignedUrls) return "ignore";
  return workspaceReady ? "send" : "queue";
}
