import type { ProjectTask } from "@/lib/projects/types";

export interface TaskState {
  isComplete: boolean;
  /** The task is open and waiting on the person looking at it. */
  needsYou: boolean;
}

/**
 * How one task reads to one viewer (app#2048).
 *
 * `needsYou` is the whole reason a client opens the link, so it is derived in
 * one place rather than re-expressed at each render site. A completed task
 * never needs anyone, even while it still carries an assignee.
 */
export function getTaskState(
  task: ProjectTask,
  viewerAccountId: string | null,
): TaskState {
  const isComplete = Boolean(task.completed_at);
  return {
    isComplete,
    needsYou:
      !isComplete &&
      Boolean(viewerAccountId) &&
      task.assignee_account_id === viewerAccountId,
  };
}
