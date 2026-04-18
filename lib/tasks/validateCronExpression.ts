import cronstrue from "cronstrue";

/**
 * Validates a 5-field cron expression for task scheduling.
 * @returns `null` when valid, otherwise a user-facing error string.
 */
export function validateCronExpression(value: string): string | null {
  const normalized = value.trim();
  if (!normalized) {
    return "Schedule is required.";
  }

  const fields = normalized.split(/\s+/);
  if (fields.length !== 5) {
    return "Use a 5-part cron expression: minute hour day month weekday.";
  }

  try {
    cronstrue.toString(normalized);
    return null;
  } catch {
    return "Invalid cron format. Try a preset or use example: 0 9 * * *";
  }
}
