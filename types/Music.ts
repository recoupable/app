export type MusicGenerationStatus = "pending" | "processing" | "completed" | "failed";

/**
 * A music generation as the API returns it (recoupable/docs#308).
 *
 * Ten fields, matching the shipped `music_generations` table. Anything another
 * system already knows is not stored and so is not returned: generation
 * parameters, the resolved seed, and the storage key all live with fal, the
 * workflow run, or the bucket.
 */
export interface MusicGeneration {
  id: string;
  status: MusicGenerationStatus;
  prompt: string;
  lyrics: string;
  model: string;
  duration_seconds: number | null;
  audio_url: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface MusicGenerationLogEntry {
  at: string;
  message: string;
}

/**
 * The single-generation read adds the progress timeline and the seed, both of
 * which the API fetches live from fal rather than storing.
 *
 * `seed` is the only generation parameter fal gives back. `num_inference_steps`
 * and `guidance_scale` are consumed at submit and never echoed by any fal
 * endpoint, so they are not part of this resource (recoupable/api#850).
 */
export interface MusicGenerationDetail extends MusicGeneration {
  seed: number | null;
  logs: MusicGenerationLogEntry[];
}
