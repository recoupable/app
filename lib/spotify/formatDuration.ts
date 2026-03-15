/**
 * Formats milliseconds to MM:SS format for track/album durations
 *
 * @param ms - Duration in milliseconds
 * @returns Formatted duration string (e.g., "3:42")
 */
export const formatDuration = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};
