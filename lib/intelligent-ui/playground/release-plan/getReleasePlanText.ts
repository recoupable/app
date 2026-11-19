import { resolveReleasePlan } from "./resolveReleasePlan";
import {
  taskLabels,
  type ReleasePlanFixture,
  type ReleasePlanEdits,
} from "./types";

export function getReleasePlanText(
  fixture: ReleasePlanFixture,
  edits: ReleasePlanEdits,
  version: number,
): string {
  const plan = resolveReleasePlan(edits);
  return [
    `Synthetic ${fixture.label} — working copy ${version ? `based on local version ${version}` : "not saved"}.`,
    `Release ID: ${fixture.scope.releaseId}; workspace: ${fixture.scope.workspaceId}.`,
    `Source: fictional delivery worksheet revision ${fixture.scope.sourceRevision}; planning fixture revision ${fixture.scope.fixtureRevision}. Dates and offsets are authored planning values, not worksheet claims.`,
    `Goal: ${plan.edits.goal}`,
    `Release date: ${plan.edits.releaseDate}; timezone: ${plan.edits.timeZone}. Calendar dates only, no scheduled time or instant.`,
    ...plan.tasks.map(
      (task) =>
        `Pending: ${taskLabels[task.id]} — ${task.date}${task.manual ? " (manual date)" : ""}.`,
    ),
    ...plan.conflicts.map((conflict) => `Conflict: ${conflict}`),
    "Saved versions remain in this tab until it closes. No tasks approved or executed; no assets completed or release published. Scheduling, distribution and publication are unavailable here.",
  ].join("\n");
}
