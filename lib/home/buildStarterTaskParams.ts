import type { CreateTaskParams } from "@/lib/tasks/createTask";

interface BuildStarterTaskParamsInput {
  artistName: string;
  artistAccountId: string;
}

/**
 * The pre-wired one-click suggestion shown in the homepage tasks module's
 * empty state: "Weekly valuation + streams report for {artist}, Mondays"
 * (recoupable/chat#1850).
 */
export function buildStarterTaskParams({
  artistName,
  artistAccountId,
}: BuildStarterTaskParamsInput): Omit<CreateTaskParams, "model"> {
  return {
    title: `Weekly valuation + streams report for ${artistName}`,
    prompt:
      `Write a weekly report email for ${artistName}. ` +
      "Include the catalog's current estimated valuation with its range, " +
      "how it changed since last week, and this week's streaming numbers " +
      "for the top tracks with week-over-week deltas. Link every data " +
      "source you cite and send the report by email.",
    schedule: "0 9 * * 1",
    artist_account_id: artistAccountId,
  };
}
