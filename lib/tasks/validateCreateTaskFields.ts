import { validateCronExpression } from "@/lib/tasks/validateCronExpression";

export type CreateTaskFormErrors = Partial<
  Record<"title" | "prompt" | "schedule" | "artist", string>
>;

export function validateCreateTaskFields(input: {
  title: string;
  prompt: string;
  schedule: string;
  artistAccountId: string;
}): CreateTaskFormErrors {
  const next: CreateTaskFormErrors = {};
  if (!input.title.trim()) next.title = "Title is required.";
  if (!input.prompt.trim()) next.prompt = "Prompt is required.";
  const scheduleError = validateCronExpression(input.schedule);
  if (scheduleError) next.schedule = scheduleError;
  if (!input.artistAccountId.trim()) next.artist = "Artist is required.";
  return next;
}
