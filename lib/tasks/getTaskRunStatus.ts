import { TASKS_API_URL } from "@/lib/consts";

/**
 * Trigger.dev run metadata. For scheduled runs `api` writes the link to the
 * workflow that does the work here (`sessionId`, `chatId`, `workflowRunId`,
 * chat#2006 item 4a); read it with `getRunWorkflowLink`.
 */
export type TaskRunMetadata = Record<string, unknown>;

export interface TaskRunStatus {
  status: string;
  error?: { message: string; name?: string; stackTrace?: string } | null;
  metadata: TaskRunMetadata | null;
  taskIdentifier: string;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  durationMs: number | null;
}

/**
 * Fetches a Trigger.dev task run from the Recoup API. For a scheduled task
 * this is the ~30s kickoff; the work happens in the workflow run linked in
 * `metadata` (see `getRunWorkflowLink`).
 */
export async function getTaskRunStatus(
  runId: string,
  accessToken: string,
): Promise<TaskRunStatus> {
  const url = new URL(`${TASKS_API_URL}/runs`);
  url.searchParams.set("runId", runId);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
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
    error: run.error ?? null,
    metadata: run.metadata ?? null,
    taskIdentifier: run.taskIdentifier,
    createdAt: run.createdAt,
    startedAt: run.startedAt ?? null,
    finishedAt: run.finishedAt ?? null,
    durationMs: run.finishedAt ? (run.durationMs ?? null) : null,
  } as TaskRunStatus;
}
