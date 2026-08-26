import type { ChatRunLifecycle } from "@/lib/tasks/getChatRunStatus";

const TERMINAL = new Set<ChatRunLifecycle>([
  "completed",
  "failed",
  "cancelled",
]);

interface GetChatRunPollIntervalInput {
  status: ChatRunLifecycle | undefined;
  error: unknown;
}

/**
 * How often the run page re-reads the workflow status: every 3s while the
 * run is queued or running, never once it is terminal, and never after the
 * fetch itself failed (a bad run id or a revoked token must not become an
 * endless request loop).
 */
export function getChatRunPollInterval({
  status,
  error,
}: GetChatRunPollIntervalInput): number | false {
  if (error) return false;
  if (status && TERMINAL.has(status)) return false;
  return 3000;
}
