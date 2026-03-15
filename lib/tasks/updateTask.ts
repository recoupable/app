import { Tables } from "@/types/database.types";
import { TASKS_API_URL } from "@/lib/consts";
import { GetTasksResponse } from "./getTasks";

type ScheduledAction = Tables<"scheduled_actions">;

export interface UpdateTaskParams {
  id: string;
  title?: string;
  prompt?: string;
  schedule?: string;
  account_id?: string;
  artist_account_id?: string;
  enabled?: boolean | null;
  model?: string | null;
}

/**
 * Updates an existing task via the Recoup API
 *
 * @param params
 * @see https://docs.recoupable.com/tasks/update
 */
export async function updateTask(params: UpdateTaskParams): Promise<ScheduledAction> {
  try {
    const response = await fetch(TASKS_API_URL, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: params.id,
        ...(params.title !== undefined && { title: params.title }),
        ...(params.prompt !== undefined && { prompt: params.prompt }),
        ...(params.schedule !== undefined && { schedule: params.schedule }),
        ...(params.account_id !== undefined && {
          account_id: params.account_id,
        }),
        ...(params.artist_account_id !== undefined && {
          artist_account_id: params.artist_account_id,
        }),
        ...(params.enabled !== undefined && { enabled: params.enabled }),
        ...(params.model !== undefined && { model: params.model }),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data: GetTasksResponse = await response.json();

    if (data.status === "error") {
      throw new Error(data.error || "Unknown error occurred");
    }

    if (!data.tasks || data.tasks.length === 0) {
      throw new Error("API returned success but no task was updated");
    }

    return data.tasks[0];
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
}
