import { calendarDate } from "./calendarDate";
import {
  releasePlanEditsSchema,
  taskIds,
  taskLabels,
  type ResolvedPlan,
  type ResolvedTask,
  type TaskId,
} from "./types";

/** Resolve a bounded dependency graph; manual dates never get silently moved. */
export function resolveReleasePlan(input: unknown): ResolvedPlan {
  const edits = releasePlanEditsSchema.parse(input);
  const resolved = new Map<TaskId, ResolvedTask>();
  const visiting = new Set<TaskId>();
  const conflicts: string[] = [];
  function visit(id: TaskId): ResolvedTask {
    const found = resolved.get(id);
    if (found) return found;
    if (visiting.has(id))
      throw new Error(
        "Task dependencies contain a cycle. Choose a release date or an earlier task as the anchor.",
      );
    visiting.add(id);
    const task = edits.tasks.find((item) => item.id === id)!;
    const anchorDate =
      task.anchor === "release" ? edits.releaseDate : visit(task.anchor).date;
    const proposedDate = calendarDate(anchorDate, task.offsetDays);
    if (!proposedDate)
      throw new Error(`${taskLabels[id]} falls outside 1900–2100.`);
    const date = task.manualDate ?? proposedDate;
    if (date > edits.releaseDate)
      conflicts.push(
        `${taskLabels[id]} is after the release date (${edits.releaseDate}).`,
      );
    if (task.anchor !== "release" && date < anchorDate)
      conflicts.push(
        `${taskLabels[id]} is before its dependency (${taskLabels[task.anchor]}, ${anchorDate}).`,
      );
    const result = { id, date, proposedDate, manual: task.manualDate !== null };
    visiting.delete(id);
    resolved.set(id, result);
    return result;
  }
  return { edits, tasks: taskIds.map(visit), conflicts };
}
