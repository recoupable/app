import {
  objectRefSchema,
  type ObjectDescriptor,
  type ObjectRef,
} from "./schemas";
import { objectRefKey } from "./objectRefKey";

/** Input must already be authorized by its owning service. This is local scope validation only. */
export function resolveSelection(
  workspaceId: string,
  available: ReadonlyMap<string, ObjectDescriptor | null>,
  selection: readonly ObjectRef[],
):
  | { state: "available"; items: ObjectDescriptor[] }
  | { state: "unavailable" } {
  if (selection.length > 8) return { state: "unavailable" };
  const keys = new Set<string>();
  const items: ObjectDescriptor[] = [];
  for (const ref of selection) {
    if (
      !objectRefSchema.safeParse(ref).success ||
      ref.workspaceId !== workspaceId
    )
      return { state: "unavailable" };
    const key = objectRefKey(ref);
    if (keys.has(key)) return { state: "unavailable" };
    keys.add(key);
    const match = available.get(key);
    if (!match || match.ref.workspaceId !== workspaceId)
      return { state: "unavailable" };
    items.push(match);
  }
  return { state: "available", items };
}
