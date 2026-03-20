import { NEW_API_BASE_URL } from "@/lib/consts";

export interface TaskRunItem {
  id: string;
  status: string;
  data?: unknown;
  error?: string;
  metadata?: Record<string, unknown> | null;
  taskIdentifier: string;
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
  const url = new URL(`${NEW_API_BASE_URL}/api/tasks/runs`);
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
