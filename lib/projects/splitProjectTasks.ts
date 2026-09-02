import { getTaskState } from "@/lib/projects/getTaskState";
import type { ProjectTask } from "@/lib/projects/types";

export interface SplitTasks {
  /** Open tasks waiting on the viewer, pinned above the rest. */
  needsYou: ProjectTask[];
  /** Every other open task, in creation order. */
  active: ProjectTask[];
  completed: ProjectTask[];
}

/**
 * Split a project's tasks into what the two tabs render (app#2048).
 *
 * Pinning happens here rather than in the list so the ordering rule lives in
 * one testable place: what the client owes us comes first, everything else
 * keeps the order the timeline was written in.
 */
export function splitProjectTasks(
  tasks: ProjectTask[],
  viewerAccountId: string | null,
): SplitTasks {
  const split: SplitTasks = { needsYou: [], active: [], completed: [] };

  for (const task of tasks) {
    const { isComplete, needsYou } = getTaskState(task, viewerAccountId);
    if (isComplete) split.completed.push(task);
    else if (needsYou) split.needsYou.push(task);
    else split.active.push(task);
  }

  return split;
}
