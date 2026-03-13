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

/**
 * Fetches recent task runs for the authenticated account.
 *
 * @param accessToken - Privy access token for authentication
 * @param limit - Maximum number of runs to return (default 20)
 * @returns Array of task run items
 */
export async function getTaskRuns(accessToken: string, limit: number = 20): Promise<TaskRunItem[]> {
  const response = await fetch(`${NEW_API_BASE_URL}/api/tasks/runs?limit=${limit}`, {
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
