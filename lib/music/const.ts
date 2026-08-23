/**
 * Generation parameter defaults and ranges.
 *
 * These mirror the documented contract (recoupable/docs#308), which in turn
 * mirrors the fal minimax/music-3 form. The API clamps to the same bounds, so
 * these are for the UI's benefit, not the source of truth.
 */
export const MUSIC_DEFAULTS = {
  duration: 60,
  numInferenceSteps: 30,
  guidanceScale: 1.7,
} as const;

export const MUSIC_RANGES = {
  duration: { min: 10, max: 300, step: 5 },
  numInferenceSteps: { min: 1, max: 100, step: 1 },
  guidanceScale: { min: 0, max: 20, step: 0.5 },
} as const;

/** Parameter descriptions, taken from the model's own schema. */
export const MUSIC_HINTS = {
  prompt:
    "Music description: style, mood, vocals, instrumentation and arrangement. Be specific about genre, BPM and key for tighter control.",
  lyrics:
    "The lyrics to sing. Structure tags such as [intro], [verse], [chorus] and [outro] must each be on their own line.",
  duration:
    "Upper bound on the generated audio length in seconds. The model may stop earlier.",
  seed: "Seed for reproducibility. Leave blank for a random seed.",
  numInferenceSteps:
    "Flow-matching steps per denoising chunk. More steps improve quality at the cost of speed.",
  guidanceScale: "Classifier-free guidance scale of the flow-matching stage.",
} as const;

/** Credits charged per second of requested audio, with a floor. Mirrors the API. */
const CREDITS_PER_SECOND = 0.5;
const MIN_CREDIT_COST = 15;

/**
 * Credits a generation of this length will cost.
 *
 * Duplicated from the API deliberately: the quote has to render before the
 * request is made, and a round trip to price a slider drag would be worse than
 * one shared constant restated. The API stays authoritative and freezes the
 * real price onto the row.
 *
 * @param durationSeconds - Requested length.
 * @returns Whole credits.
 */
export function creditCostForDuration(durationSeconds: number): number {
  return Math.max(MIN_CREDIT_COST, Math.ceil(durationSeconds * CREDITS_PER_SECOND));
}

/**
 * Dollar cost of a generation, for display beside the credit figure.
 *
 * @param credits - Credits the generation will cost.
 * @returns The cost formatted as USD.
 */
export function formatCreditCostUsd(credits: number): string {
  return `$${(credits / 100).toFixed(2)}`;
}
