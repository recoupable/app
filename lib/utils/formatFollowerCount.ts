/**
 * Formats a follower count number to a human-readable string
 * Converts large numbers to K or M format (e.g. 1.2K, 3.5M)
 *
 * @param count - Number to format or null
 * @returns Formatted string representation
 */
const formatFollowerCount = (count: number | null): string => {
  if (count === null) return "-";
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
};

export default formatFollowerCount;
