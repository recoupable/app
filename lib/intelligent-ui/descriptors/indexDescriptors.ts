import type { ObjectDescriptor } from "./schemas";
import { objectRefKey } from "./objectRefKey";

/** Build once per authorized dataset revision. Ambiguous exact refs are unavailable. */
export function indexDescriptors(
  items: readonly ObjectDescriptor[],
): ReadonlyMap<string, ObjectDescriptor | null> {
  const index = new Map<string, ObjectDescriptor | null>();
  for (const item of items) {
    const key = objectRefKey(item.ref);
    index.set(key, index.has(key) ? null : item);
  }
  return index;
}
