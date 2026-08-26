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
  // step 0.1, not fal's 0.5: the documented default is 1.7, which is not a
  // multiple of 0.5, so a coarser step left the thumb snapped to 1.5 while the
  // readout said 1.7 and made the default unreachable once dragged. fal can
  // use 0.5 because its control is a number field you can type into.
  guidanceScale: { min: 0, max: 20, step: 0.1 },
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
const CREDITS_PER_SECOND = 0.2;

/**
 * Most a generation of this length will cost.
 *
 * An upper bound, not a price. The API charges for the audio fal actually
 * produces, and the model routinely stops short of the requested length, so
 * the real deduction is usually lower (recoupable/api#853). Quoting the
 * maximum keeps the promise safe in the only direction that matters: a
 * customer is never charged more than they were shown.
 *
 * Duplicated from the API deliberately: the quote has to render before the
 * request is made, and a round trip to price a slider drag would be worse than
 * one shared constant restated. The API stays authoritative and freezes the
 * real price onto the row.
 *
 * @param durationSeconds - Requested length.
 * @returns Whole credits, at fal's own rate.
 */
export function creditCostForDuration(durationSeconds: number): number {
  if (durationSeconds <= 0) return 0;

  return Math.max(1, Math.ceil(durationSeconds * CREDITS_PER_SECOND));
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
