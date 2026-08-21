/**
 * Format a duration in seconds as m:ss.
 *
 * @param seconds - Duration in seconds, or null before a generation finishes.
 * @returns The formatted duration, or an em-free placeholder when unknown.
 */
export function formatDuration(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds)) return "0:00";

  const whole = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(whole / 60);
  const remainder = whole % 60;

  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}
