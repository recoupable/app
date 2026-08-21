export type MusicGenerationStatus = "pending" | "processing" | "completed" | "failed";

export interface MusicGeneration {
  id: string;
  status: MusicGenerationStatus;
  prompt: string;
  lyrics: string;
  title: string | null;
  model: string;
  duration_seconds: number | null;
  seed: number | null;
  num_inference_steps: number | null;
  guidance_scale: number | null;
  audio_url: string | null;
  mime_type: string | null;
  file_size_bytes: number | null;
  organization_id: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface MusicGenerationLogEntry {
  at: string;
  message: string;
}

/** The single-generation read adds the workflow timeline. */
export interface MusicGenerationDetail extends MusicGeneration {
  logs: MusicGenerationLogEntry[];
}
