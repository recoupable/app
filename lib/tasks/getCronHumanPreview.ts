import cronstrue from "cronstrue";
import { validateCronExpression } from "@/lib/tasks/validateCronExpression";

/**
 * Human-readable description of a cron expression, or `null` if invalid.
 */
export function getCronHumanPreview(value: string): string | null {
  const normalized = value.trim();
  if (validateCronExpression(normalized)) {
    return null;
  }
  try {
    return cronstrue.toString(normalized);
  } catch {
    return null;
  }
}
