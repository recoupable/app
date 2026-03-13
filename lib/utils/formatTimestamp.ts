import { formatDistanceToNow, format } from "date-fns";

/**
 * Formats a timestamp to a human-readable string
 * Returns relative time (e.g. "2 hours ago") and optionally the full date
 *
 * @param timestamp - ISO date string to format
 * @param short - If true, returns only the relative time without the full date
 * @returns Formatted timestamp string
 */
const formatTimestamp = (timestamp: string, short = false): string => {
  try {
    if (short) {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    }
    return `${formatDistanceToNow(new Date(timestamp), { addSuffix: true })} (${format(new Date(timestamp), "PPP")})`;
  } catch {
    return "Recently";
  }
};

export default formatTimestamp;
