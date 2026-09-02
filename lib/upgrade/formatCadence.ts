const CADENCE_WORDS: Record<number, string> = { 10080: "weekly", 1440: "daily", 60: "hourly" };

/** A plan's fastest cadence in words, from the api's `min_cadence_minutes`. */
export function formatCadence(minutes: number): string {
  return CADENCE_WORDS[minutes] ?? `every ${minutes} minutes`;
}
