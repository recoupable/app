import { Tables } from "@/types/database.types";

// IMAGES
export interface ImageGenerationResult {
  imageUrl: string | null;
}

// TASKS
export type ScheduledAction = Tables<"scheduled_actions">;

// SORA 2
