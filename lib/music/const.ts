import { usdToCredits } from "@/lib/credits/usdToCredits";

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

/**
 * fal's rate for the music model, passed through with no markup
 * (recoupable/api#856). The api charges the same rate on the audio actually
 * generated, so a quote from this constant equals the charge for a full-length
 * result.
 */
const MUSIC_USD_PER_SECOND = 0.002;

/**
 * Upper-bound cost of a generation, in credits.
 *
 * @param durationSeconds - Requested duration.
 * @returns Credits for the full duration at fal's rate; 0 for a non-positive
 *   duration, which the api also does not charge.
 */
export function creditCostForDuration(durationSeconds: number): number {
  if (durationSeconds <= 0) return 0;
  return usdToCredits(durationSeconds * MUSIC_USD_PER_SECOND);
}
