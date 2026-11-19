import { resolveReleasePlan } from "./resolveReleasePlan";
import { taskLabels, type ReleasePlanEdits } from "./types";

export function getReleasePlanDiff(
  before: ReleasePlanEdits,
  after: ReleasePlanEdits,
): string[] {
  const previous = resolveReleasePlan(before);
  const next = resolveReleasePlan(after);
  const changes: string[] = [];
  for (const [key, label] of [
    ["goal", "Goal"],
    ["releaseDate", "Release date"],
    ["timeZone", "Timezone"],
  ] as const) {
    if (before[key] !== after[key])
      changes.push(`${label}: ${before[key]} → ${after[key]}`);
  }
  for (const task of next.edits.tasks) {
    const old = previous.edits.tasks.find((item) => item.id === task.id)!;
    const oldDate = previous.tasks.find((item) => item.id === task.id)!.date;
    const newDate = next.tasks.find((item) => item.id === task.id)!.date;
    const anchorLabel = (anchor: typeof task.anchor) =>
      anchor === "release" ? "release date" : taskLabels[anchor];
    if (old.anchor !== task.anchor || old.offsetDays !== task.offsetDays)
      changes.push(
        `${taskLabels[task.id]} rule: ${old.offsetDays} days from ${anchorLabel(old.anchor)} → ${task.offsetDays} days from ${anchorLabel(task.anchor)}`,
      );
    if (old.manualDate !== task.manualDate)
      changes.push(
        `${taskLabels[task.id]} manual date: ${old.manualDate ?? "none"} → ${task.manualDate ?? "none"}`,
      );
    if (oldDate !== newDate)
      changes.push(`${taskLabels[task.id]} date: ${oldDate} → ${newDate}`);
  }
  return changes;
}
