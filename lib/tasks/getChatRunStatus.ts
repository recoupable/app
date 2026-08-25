import { NEW_API_BASE_URL } from "@/lib/consts";

export type ChatRunLifecycle =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export interface ChatRunStatus {
  status: ChatRunLifecycle;
  createdAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  durationMs: number | null;
}

/**
 * Status + timing of a Vercel Workflow run via `GET /api/chat/runs/{runId}`
 * (chat#2006 item 4a). This is the run that does a scheduled task's work;
 * the Trigger.dev run only kicks it off.
 */
export async function getChatRunStatus(
  workflowRunId: string,
  accessToken: string,
): Promise<ChatRunStatus> {
  const response = await fetch(
    `${NEW_API_BASE_URL}/api/chat/runs/${workflowRunId}`,
    { method: "GET", headers: { Authorization: `Bearer ${accessToken}` } },
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch workflow run status");
  }
  return {
    status: data.status,
    createdAt: data.createdAt ?? null,
    startedAt: data.startedAt ?? null,
    completedAt: data.completedAt ?? null,
    durationMs: data.durationMs ?? null,
  };
}
