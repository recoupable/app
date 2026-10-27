import type { ObjectRef } from "./schemas";

/** Stable subject handle for schema-v1 rows. Exact evidence selection additionally binds source versions. */
export function objectRowId(ref: ObjectRef): string {
  return `${ref.workspaceId.length}:${ref.workspaceId}:${ref.authority}:${ref.kind}:${ref.id}`;
}
