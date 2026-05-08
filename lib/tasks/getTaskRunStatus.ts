import { TASKS_API_URL } from "@/lib/consts";

export interface TaskRunMetadata {
  currentStep?: string;
  logs?: string[];
  [key: string]: unknown;
}

export interface TaskRunStatus {
  status: string;
  output?: unknown;
  error?: { message: string; name?: string; stackTrace?: string } | null;
  metadata: TaskRunMetadata | null;
  taskIdentifier: string;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  durationMs: number | null;
}

interface GetTaskRunStatusOptions {
  accountIdOverride?: string;
}

/**
 * Fetches the current status of a Trigger.dev task run from the Recoup API.
 */
export async function getTaskRunStatus(
  runId: string,
  accessToken: string | null | undefined,
  options: GetTaskRunStatusOptions = {},
): Promise<TaskRunStatus> {
  const token = accessToken ?? "";
  const url = new URL(`${TASKS_API_URL}/runs`);
  url.searchParams.set("runId", runId);
  if (options.accountIdOverride) {
    url.searchParams.set("account_id", options.accountIdOverride);
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch task run status");
  }

  const run = data.runs?.[0];
  if (!run) {
    throw new Error("Task run not found");
  }

  return {
    status: run.status,
    output: run.output ?? undefined,
    error: run.error ?? null,
    metadata: run.metadata ?? null,
    taskIdentifier: run.taskIdentifier,
    createdAt: run.createdAt,
    startedAt: run.startedAt ?? null,
    finishedAt: run.finishedAt ?? null,
    durationMs: run.finishedAt ? (run.durationMs ?? null) : null,
  } as TaskRunStatus;
}
