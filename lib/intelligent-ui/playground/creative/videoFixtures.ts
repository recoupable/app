import type { CreativeAsset } from "./types";
import { videoClips } from "./videoClips";

export const videoFixtures: CreativeAsset[] = [
  {
    ref: {
      authority: "fixture",
      assetId: "motion-study-square",
      version: videoClips["motion-square"].version,
    },
    label: "Motion study: horizontal square",
    caption:
      "Silent three-second clip: a blue square travels from left to right across a white background. No speech, music or sound; no speech captions are supplied.",
    provenance:
      "Original deterministic local geometric study, authored with scripts/create-creative-video-fixtures.py and FFmpeg 8.0.1. 320 × 180, 12 fps, 36 frames. No downloaded samples, customer footage or generation provider; not production-quality evidence.",
    status: "available",
    preview: "motion-square",
  },
  {
    ref: {
      authority: "fixture",
      assetId: "motion-study-circle",
      version: videoClips["motion-circle"].version,
    },
    label: "Motion study: vertical circle",
    caption:
      "Silent three-second clip: a dark-green circle travels from top to bottom on a white background. No speech, music or sound; no speech captions are supplied.",
    provenance:
      "Original deterministic local geometric study, authored with the same bounded FFmpeg recipe. 320 × 180, 12 fps, 36 frames. A different motion study, not a later revision or customer proposal.",
    status: "available",
    preview: "motion-circle",
  },
];
