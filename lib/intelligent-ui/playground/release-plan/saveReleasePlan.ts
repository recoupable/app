import { getReleasePlanKey } from "./getReleasePlanKey";
import { readReleasePlan } from "./readReleasePlan";
import { resolveReleasePlan } from "./resolveReleasePlan";
import {
  savedReleasePlanSchema,
  type ReleasePlanFixture,
  type PlanStorage,
  type LocalPlanBase,
  type ReleasePlanEdits,
} from "./types";

/** Synchronous sessionStorage transaction in one tab; no cross-tab/backend authority. */
export function saveReleasePlan(
  storage: PlanStorage,
  fixture: ReleasePlanFixture,
  base: LocalPlanBase,
  proposed: ReleasePlanEdits,
): { status: "saved" | "duplicate"; base: LocalPlanBase } {
  const plan = resolveReleasePlan(proposed);
  if (plan.conflicts.length)
    throw new Error("Resolve the proposed date conflicts before saving.");
  const current = readReleasePlan(storage, fixture);
  const sameEdits =
    JSON.stringify(current.edits) === JSON.stringify(plan.edits);
  if (current.version === base.version + 1 && sameEdits)
    return { status: "duplicate", base: current };
  if (current.token !== base.token || current.version !== base.version)
    throw new Error(
      "A newer or changed local version exists. Reload it before reviewing your changes again.",
    );
  if (base.version > 0 && sameEdits)
    return { status: "duplicate", base: current };
  const saved = savedReleasePlanSchema.parse({
    schemaVersion: 1,
    scope: fixture.scope,
    version: current.version + 1,
    edits: plan.edits,
  });
  const raw = JSON.stringify(saved);
  storage.setItem(getReleasePlanKey(fixture.scope), raw);
  if (storage.getItem(getReleasePlanKey(fixture.scope)) !== raw)
    throw new Error(
      "Could not verify the local save. Reload to check it; your working edits remain visible.",
    );
  return {
    status: "saved",
    base: { version: saved.version, edits: saved.edits, token: raw },
  };
}
