import { Tables } from "@/types/database.types";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import { GetTasksResponse } from "./getTasks";

type ScheduledAction = Tables<"scheduled_actions">;

export interface CreateTaskParams {
  title: string;
  prompt: string;
  schedule: string;
  artist_account_id: string;
  account_id?: string;
  model?: string | null;
}

/**
 * Creates a new scheduled task via the Recoup API.
 * Requires a valid bearer token because POST /api/tasks is auth-enforced.
 */
export async function createTask(
  accessToken: string,
  params: CreateTaskParams,
): Promise<ScheduledAction> {
  const response = await fetch(`${getClientApiBaseUrl()}/api/tasks`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: params.title,
      prompt: params.prompt,
      schedule: params.schedule,
      artist_account_id: params.artist_account_id,
      ...(params.account_id ? { account_id: params.account_id } : {}),
      ...(params.model !== undefined ? { model: params.model } : {}),
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
    throw new Error("API returned success but no task was created");
  }

  return data.tasks[0];
}
