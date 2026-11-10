import { releasePlanScopeSchema, type ReleasePlanScope } from "./types";

export function getReleasePlanKey(scope: ReleasePlanScope): string {
  return `recoup:release-plan-fixture:v1:${JSON.stringify(releasePlanScopeSchema.parse(scope))}`;
}
