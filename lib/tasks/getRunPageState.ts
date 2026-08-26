import type { TaskRunStatus } from "@/lib/tasks/getTaskRunStatus";
import type {
  ChatRunStatus,
  ChatRunLifecycle,
} from "@/lib/tasks/getChatRunStatus";
import { getRunWorkflowLink } from "@/lib/tasks/getRunWorkflowLink";

const WORKFLOW_STATUS_KEY: Record<ChatRunLifecycle, string> = {
  queued: "QUEUED",
  running: "EXECUTING",
  completed: "COMPLETED",
  failed: "FAILED",
  cancelled: "CANCELED",
};

export type RunPageState =
  | { view: "loading" }
  | {
      view: "unlinked";
      statusKey: string;
      firedAt: string;
      startedAt: string | null;
      finishedAt: string | null;
      durationMs: number | null;
    }
  | { view: "unavailable"; firedAt: string; chatHref: string }
  | {
      view: "linked";
      statusKey: string;
      firedAt: string;
      startedAt: string | null;
      finishedAt: string | null;
      durationMs: number | null;
      chatHref: string;
    };

interface GetRunPageStateInput {
  triggerRun: TaskRunStatus;
  workflow: ChatRunStatus | undefined;
  /** The workflow status fetch failed (after retries); never spin forever on it. */
  workflowFailed?: boolean;
}

/**
 * What the run page shows (chat#2006 item 4b). The Trigger.dev run is the
 * ~30s kickoff, so only its fired-at time is interesting; status, timeline
 * and the transcript come from the workflow run it started. Runs fired
 * before the link existed fall back to the Trigger run's own status and
 * timings; a failed status fetch keeps the chat link but never spins.
 */
export function getRunPageState({
  triggerRun,
  workflow,
  workflowFailed = false,
}: GetRunPageStateInput): RunPageState {
  const link = getRunWorkflowLink(triggerRun.metadata);
  if (!link) {
    return {
      view: "unlinked",
      statusKey: triggerRun.status,
      firedAt: triggerRun.createdAt,
      startedAt: triggerRun.startedAt,
      finishedAt: triggerRun.finishedAt,
      durationMs: triggerRun.durationMs,
    };
  }
  const chatHref = `/sessions/${link.sessionId}/chats/${link.chatId}`;
  if (!workflow) {
    return workflowFailed
      ? { view: "unavailable", firedAt: triggerRun.createdAt, chatHref }
      : { view: "loading" };
  }
  return {
    view: "linked",
    statusKey: WORKFLOW_STATUS_KEY[workflow.status],
    firedAt: triggerRun.createdAt,
    startedAt: workflow.startedAt,
    finishedAt: workflow.completedAt,
    durationMs: workflow.durationMs,
    chatHref,
  };
}
