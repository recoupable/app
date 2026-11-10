import { videoFixtures } from "./videoFixtures";
import { audioFixtures } from "./audioFixtures";
import { creativeFixtures } from "./creativeFixtures";
import { creativeRefKey } from "./creativeRefKey";
import type { CreativeAsset } from "./types";

/** Exact allowlist: no supplied URL, version alias or Context permission resolution. */
export function resolveCreativeAsset(asset: CreativeAsset): string | undefined {
  const known = [...creativeFixtures, ...audioFixtures, ...videoFixtures].find(
    (item) =>
      creativeRefKey(item.ref) === creativeRefKey(asset.ref) &&
      item.preview === asset.preview,
  );
  if (!known || asset.status !== "available") return undefined;
  if (known.preview === "study-intro" || known.preview === "study-chorus")
    return `/api/intelligent-ui/playground/audio-excerpts/${known.ref.version}`;
  if (known.preview === "motion-square" || known.preview === "motion-circle")
    return `/api/intelligent-ui/playground/video-clips/${known.ref.version}`;
  return known.preview === "light-wordmark"
    ? "/brand/wordmark-lightmode.svg"
    : "/brand/wordmark-darkmode.svg";
}
