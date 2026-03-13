import { ScheduledAction } from "@/components/VercelChat/types";
import { TASKS_API_URL } from "@/lib/consts";

export interface DeleteTaskParams {
  id: string;
}

const SCHEDULE_NOT_FOUND_MSG = "Schedule not found";

/**
 * Check if error indicates schedule not found in external scheduler
 * Paused tasks are removed from the scheduler, making this error expected
 *
 * @param errorText
 */
function isScheduleNotFoundError(errorText: string): boolean {
  return errorText.includes(SCHEDULE_NOT_FOUND_MSG);
}

/**
 * Delete task record from database when scheduler deletion isn't possible
 *
 * @param taskId
 */
async function deleteTaskFromDatabase(taskId: string): Promise<void> {
  await fetch("/api/scheduled-actions/delete", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: taskId }),
  });
}

/**
 * Deletes a task via the Recoup API and database
 *
 * @param params
 * @see https://docs.recoupable.com/tasks/delete
 */
export async function deleteTask(params: DeleteTaskParams): Promise<void> {
  try {
    const response = await fetch(TASKS_API_URL, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: params.id,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();

      if (isScheduleNotFoundError(errorText)) {
        await deleteTaskFromDatabase(params.id);
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
