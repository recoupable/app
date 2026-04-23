import cronstrue from "cronstrue";

/**
 * Human-readable description of a cron expression, or `null` if invalid.
 */
export function getCronHumanPreview(value: string): string | null {
  try {
    return cronstrue.toString(value.trim());
  } catch {
    return null;
  }
}
