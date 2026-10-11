import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

export interface TaskRunItem {
  id: string;
  status: string;
  data?: unknown;
  error?: string;
  metadata?: Record<string, unknown> | null;
  taskIdentifier: string;
  /** Originating scheduled task's title; null or absent when unresolvable. */
  title?: string | null;
  /** Subject of the newest email this run sent; null/absent when none (chat#1958). */
  email_subject?: string | null;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  durationMs: number | null;
}

interface TaskRunListResponse {
  status: "success" | "error";
  runs?: TaskRunItem[];
  error?: string;
}

interface GetTaskRunsOptions {
  accountIdOverride?: string;
}

/**
 * Fetches recent task runs for the authenticated account.
 *
 * @param accessToken - Privy access token for authentication
 * @param options - Optional overrides
 * @returns Array of task run items
 */
export async function getTaskRuns(
  accessToken: string,
  options: GetTaskRunsOptions = {},
): Promise<TaskRunItem[]> {
  const url = new URL(`${getClientApiBaseUrl()}/api/tasks/runs`);
  url.searchParams.set("limit", "20");

  if (options.accountIdOverride) {
    url.searchParams.set("account_id", options.accountIdOverride);
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data: TaskRunListResponse = await response.json();

  if (!response.ok || data.status === "error") {
    throw new Error(data.error || "Failed to fetch task runs");
  }

  return data.runs || [];
}
