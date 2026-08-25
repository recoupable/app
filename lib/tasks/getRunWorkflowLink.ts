export interface RunWorkflowLink {
  sessionId: string;
  chatId: string;
  workflowRunId: string;
}

/**
 * The chat + workflow a scheduled run kicked off, read from the Trigger.dev
 * run's metadata where `POST /api/chat/runs` writes it (chat#2006 item 4a).
 * Null for runs fired before the link existed, so the page can degrade
 * instead of spinning.
 */
export function getRunWorkflowLink(
  metadata: Record<string, unknown> | null | undefined,
): RunWorkflowLink | null {
  const sessionId = metadata?.sessionId;
  const chatId = metadata?.chatId;
  const workflowRunId = metadata?.workflowRunId;
  if (
    typeof sessionId !== "string" ||
    typeof chatId !== "string" ||
    typeof workflowRunId !== "string"
  ) {
    return null;
  }
  return { sessionId, chatId, workflowRunId };
}
