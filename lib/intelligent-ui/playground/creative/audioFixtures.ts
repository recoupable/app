import type { CreativeAsset } from "./types";
import { audioExcerpts } from "./audioExcerpts";

/** Different sections of one authored synthetic study, not customer variants. */
export const audioFixtures: CreativeAsset[] = [
  {
    ref: {
      authority: "fixture",
      assetId: "section-study-intro",
      version: audioExcerpts["study-intro"].version,
    },
    label: "Section study: intro",
    caption:
      "Intro, 0–8 seconds of the original study. Eight seconds of mono instrumental PCM; no speech or lyrics.",
    provenance:
      "Original deterministic section study, createSectionStudyAudio.ts. Exact PCM slice [0, 8), with WAV length fields rewritten. Different section of one synthetic study, not a generated customer variant or production-quality evidence.",
    status: "available",
    preview: "study-intro",
  },
  {
    ref: {
      authority: "fixture",
      assetId: "section-study-chorus",
      version: audioExcerpts["study-chorus"].version,
    },
    label: "Section study: chorus",
    caption:
      "Chorus, 28–40 seconds of the original study. Twelve seconds of mono instrumental PCM; no speech or lyrics.",
    provenance:
      "Original deterministic section study, createSectionStudyAudio.ts. Exact PCM slice [28, 40), with WAV length fields rewritten. Different section of the same study, not a later edit or customer proposal.",
    status: "available",
    preview: "study-chorus",
  },
];
