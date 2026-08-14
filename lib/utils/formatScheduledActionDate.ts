/**
 * Format date for scheduled actions in the viewer's local time, with the local
 * timezone abbreviation appended (e.g. "Jan 15, 2:30 PM PST").
 *
 * @param dateString ISO date string or null
 * @returns Formatted date string or "Never" if null
 */
export const formatScheduledActionDate = (dateString: string | null): string => {
  if (!dateString) return "Never";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
  } catch {
    return "Invalid date";
  }
};