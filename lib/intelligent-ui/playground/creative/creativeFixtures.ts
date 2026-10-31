import type { CreativeAsset } from "./types";

/** Existing owned brand variants, not sequential edits or generated customer work. */
export const creativeFixtures: CreativeAsset[] = [
  {
    ref: {
      authority: "fixture",
      assetId: "recoup-wordmark",
      version:
        "f01b52c457c1d94cb2ff78934c930d245dec1072fae47a73ec3eaaed550cf292",
    },
    label: "Light-background wordmark",
    caption:
      "Existing Recoup wordmark for a light background. Compare the mark and lettering at the supplied revision.",
    provenance:
      "Owned repository asset: public/brand/wordmark-lightmode.svg. Existing brand variant; no generation job or customer approval is represented.",
    status: "available",
    preview: "light-wordmark",
  },
  {
    ref: {
      authority: "fixture",
      assetId: "recoup-wordmark",
      version:
        "a69eda99d27a759af1b19fefab4c956ede4be90a13fd5e18d4b4c633ce26d41b",
    },
    label: "Dark-background wordmark",
    caption:
      "Existing Recoup wordmark for a dark background. This is an alternate treatment, not a later revision of the light variant.",
    provenance:
      "Owned repository asset: public/brand/wordmark-darkmode.svg. Existing brand variant; no generation job or customer approval is represented.",
    status: "available",
    preview: "dark-wordmark",
  },
];
