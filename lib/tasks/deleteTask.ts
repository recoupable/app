import { TASKS_API_URL } from "@/lib/consts";

export interface DeleteTaskParams {
  id: string;
}

const SCHEDULE_NOT_FOUND_MSG = "Schedule not found";

/**
 * Check if error indicates schedule not found in external scheduler
 * Paused tasks are removed from the scheduler, making this error expected
 */
function isScheduleNotFoundError(errorText: string): boolean {
  return errorText.includes(SCHEDULE_NOT_FOUND_MSG);
}

/**
 * Delete task record from database when scheduler deletion isn't possible
 */
async function deleteTaskFromDatabase(taskId: string): Promise<void> {
  await fetch("/api/scheduled-actions/delete", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: taskId }),
  });
}

interface DeleteTaskApiResponse {
  status: "success" | "error";
  error?: string;
}

/**
 * Deletes a task via the Recoup API and database.
 *
 * @param accessToken - Privy access token (same auth model as getTasks).
 * @param params - Task id to delete.
 * @see https://docs.recoupable.com/tasks/delete
 */
export async function deleteTask(accessToken: string, params: DeleteTaskParams): Promise<void> {
  const response = await fetch(TASKS_API_URL, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      id: params.id,
    }),
  });

  const responseText = await response.text();

  if (!response.ok) {
    if (isScheduleNotFoundError(responseText)) {
      await deleteTaskFromDatabase(params.id);
      return;
    }

    throw new Error(`HTTP ${response.status}: ${responseText}`);
  }

  let data: DeleteTaskApiResponse;
  try {
    data = JSON.parse(responseText) as DeleteTaskApiResponse;
  } catch {
    throw new Error("Failed to delete task: invalid response");
  }

  if (data.status === "error") {
    throw new Error(data.error || "Failed to delete task");
  }
}
