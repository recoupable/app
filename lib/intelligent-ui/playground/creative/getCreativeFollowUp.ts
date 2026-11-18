import type { CreativeAsset, CreativeRef } from "./types";
import { creativeRefKey } from "./creativeRefKey";
import { resolveCreativeAsset } from "./resolveCreativeAsset";

/** Read-only fixture reference. No notes, media URLs, Context refs or action authority. */
export function getCreativeFollowUp(
  scope: string,
  selected: CreativeRef | null,
  assets: CreativeAsset[],
) {
  if (!selected) return null;
  const matches = assets.filter(
    (asset) => creativeRefKey(asset.ref) === creativeRefKey(selected),
  );
  if (matches.length !== 1 || !resolveCreativeAsset(matches[0])) return null;
  return {
    kind: "local-creative-reference" as const,
    scope,
    selection: { ...selected },
  };
}
