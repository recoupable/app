import { getReleasePlanKey } from "./getReleasePlanKey";
import { resolveReleasePlan } from "./resolveReleasePlan";
import {
  savedReleasePlanSchema,
  type ReleasePlanFixture,
  type PlanStorage,
  type LocalPlanBase,
} from "./types";

export function readReleasePlan(
  storage: PlanStorage,
  fixture: ReleasePlanFixture,
): LocalPlanBase {
  const token = storage.getItem(getReleasePlanKey(fixture.scope));
  if (token === null)
    return { version: 0, edits: structuredClone(fixture.initial), token };
  if (token.length > 12000)
    throw new Error("Stored local plan is too large. It has not been changed.");
  const parsed = savedReleasePlanSchema.safeParse(JSON.parse(token));
  if (
    !parsed.success ||
    getReleasePlanKey(parsed.data.scope) !== getReleasePlanKey(fixture.scope)
  )
    throw new Error(
      "Stored plan does not match this fixture and worksheet revision. It has not been changed.",
    );
  const plan = resolveReleasePlan(parsed.data.edits);
  if (plan.conflicts.length)
    throw new Error(
      "Stored local plan has unresolved conflicts. It has not been changed.",
    );
  return { version: parsed.data.version, edits: plan.edits, token };
}
