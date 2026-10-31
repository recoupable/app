import type { ObjectRef } from "./schemas";

/** Labels and row positions never participate in identity. */
export function objectRefKey(ref: ObjectRef): string {
  return JSON.stringify([
    ref.workspaceId,
    ref.authority,
    ref.kind,
    ref.id,
    [...ref.sourceVersionIds].sort(),
  ]);
}
