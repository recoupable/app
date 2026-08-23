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
 * The single-generation read adds the progress timeline, which the API fetches
 * live from fal rather than storing.
 */
export interface MusicGenerationDetail extends MusicGeneration {
  logs: MusicGenerationLogEntry[];
}
