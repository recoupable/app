import { creativeFixtures } from "./creativeFixtures";
import { creativeRefKey } from "./creativeRefKey";
import type { CreativeAsset } from "./types";

/** Exact allowlist: no supplied URL, version alias or Context permission resolution. */
export function resolveCreativeAsset(asset: CreativeAsset): string | undefined {
  const known = creativeFixtures.find(
    (item) =>
      creativeRefKey(item.ref) === creativeRefKey(asset.ref) &&
      item.preview === asset.preview,
  );
  if (!known || asset.status !== "available") return undefined;
  return known.preview === "light-wordmark"
    ? "/brand/wordmark-lightmode.svg"
    : "/brand/wordmark-darkmode.svg";
}
