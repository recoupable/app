import { Tables } from "@/types/database.types";
import { TaskRunItem } from "@/lib/tasks/getTaskRuns";
import { TASKS_API_URL } from "@/lib/consts";

type ScheduledAction = Tables<"scheduled_actions">;

export type Task = ScheduledAction & {
  recent_runs?: TaskRunItem[];
  upcoming?: string[];
};

export interface GetTasksParams {
  id?: string;
  account_id?: string;
  artist_account_id?: string;
}

export interface GetTasksResponse {
  status: "success" | "error";
  tasks: Task[];
  error?: string;
}

/**
 * Fetches tasks from the Recoup API
 * @see https://docs.recoupable.com/tasks/get
 */
export async function getTasks(
  accessToken: string,
  params?: GetTasksParams
): Promise<Task[]> {
  try {
    const url = new URL(TASKS_API_URL);

    if (params?.id) {
      url.searchParams.append("id", params.id);
    }

    if (params?.account_id) {
      url.searchParams.append("account_id", params.account_id);
    }

    if (params?.artist_account_id) {
      url.searchParams.append("artist_account_id", params.artist_account_id);
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data: GetTasksResponse = await response.json();

    if (data.status === "error") {
      throw new Error(data.error || "Unknown error occurred");
    }

    return data.tasks as Task[];
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
}
