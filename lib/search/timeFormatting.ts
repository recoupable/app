/**
 *
 * @param seconds
 */
export function formatTimeRemaining(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (mins === 0) {
    return `${secs} seconds`;
  }

  if (secs === 0) {
    return `${mins} ${mins === 1 ? "minute" : "minutes"}`;
  }

  return `${mins} ${mins === 1 ? "minute" : "minutes"}`;
}

/**
 *
 * @param elapsedSeconds
 * @param totalSeconds
 */
export function calculateProgressPercent(elapsedSeconds: number, totalSeconds: number): number {
  return Math.min((elapsedSeconds / totalSeconds) * 100, 100);
}
