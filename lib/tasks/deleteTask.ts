import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

export interface DeleteTaskParams {
  id: string;
}

const SCHEDULE_NOT_FOUND_MSG = "Schedule not found";

interface DeleteTaskResponse {
  status: "success" | "error";
  error?: string;
}

function isScheduleNotFoundError(errorText: string): boolean {
  return errorText.includes(SCHEDULE_NOT_FOUND_MSG);
}

/** Chat app route that performs the scheduled-action delete (legacy fallback). */
async function deleteTaskViaScheduledActionsRoute(taskId: string): Promise<void> {
  const response = await fetch("/api/scheduled-actions/delete", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: taskId }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }
}

/**
 * Deletes a task via the Recoup API.
 * @see https://docs.recoupable.com/tasks/delete
 */
export async function deleteTask(
  accessToken: string,
  params: DeleteTaskParams,
): Promise<void> {
  const response = await fetch(`${getClientApiBaseUrl()}/api/tasks`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: params.id,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();

    if (isScheduleNotFoundError(errorText)) {
      await deleteTaskViaScheduledActionsRoute(params.id);
      return;
    }

    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const data = (await response.json()) as DeleteTaskResponse;
  if (data.status === "error") {
    if (isScheduleNotFoundError(data.error || "")) {
      await deleteTaskViaScheduledActionsRoute(params.id);
      return;
    }

    throw new Error(data.error || "Unknown error occurred");
  }
}
