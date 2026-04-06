import { ScheduledAction } from "@/components/VercelChat/types";
import { TASKS_API_URL } from "@/lib/consts";

export interface DeleteTaskParams {
  id: string;
  accessToken: string;
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
async function deleteTaskFromDatabase(taskId: string, accessToken: string): Promise<void> {
  await fetch("/api/scheduled-actions/delete", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ id: taskId }),
  });
}

/**
 * Deletes a task via the Recoup API and database
 * @see https://docs.recoupable.com/tasks/delete
 */
export async function deleteTask(params: DeleteTaskParams): Promise<void> {
  try {
    if (!params.accessToken) {
      throw new Error("Please sign in to delete scheduled actions");
    }

    const response = await fetch(TASKS_API_URL, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${params.accessToken}`,
      },
      body: JSON.stringify({
        id: params.id,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();

      if (isScheduleNotFoundError(errorText)) {
        await deleteTaskFromDatabase(params.id, params.accessToken);
        return;
      }

      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data: ScheduledAction = await response.json();

    if (!data) {
      throw new Error("Failed to delete task");
    }
  } catch (error) {
    throw error;
  }
}
