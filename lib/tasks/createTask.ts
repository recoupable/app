import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import { throwIfPlanLimit } from "@/lib/tasks/throwIfPlanLimit";
import type { Task } from "./getTasks";
import type { CreateTaskApiResponse } from "./createTaskApiResponse";

export interface CreateTaskParams {
  title: string;
  prompt: string;
  schedule: string;
  artist_account_id: string;
  /** When omitted, the API uses the authenticated account. When set, must be allowed for the caller (e.g. org membership). */
  account_id?: string;
  model?: string | null;
  /** IANA timezone (e.g. "America/Los_Angeles") the cron schedule is interpreted in. */
  timezone?: string;
}

/**
 * Creates a new scheduled task via the Recoup API.
 * Requires a valid bearer token. Optional `account_id` matches OpenAPI `CreateTaskRequest`.
 */
export async function createTask(
  accessToken: string,
  params: CreateTaskParams,
): Promise<Task> {
  const body: Record<string, string> = {
    title: params.title,
    prompt: params.prompt,
    schedule: params.schedule,
    artist_account_id: params.artist_account_id,
  };

  if (params.account_id !== undefined && params.account_id !== "") {
    body.account_id = params.account_id;
  }

  if (
    params.model !== undefined &&
    params.model !== null &&
    params.model !== ""
  ) {
    body.model = params.model;
  }

  if (params.timezone !== undefined && params.timezone !== "") {
    body.timezone = params.timezone;
  }

  const response = await fetch(`${getClientApiBaseUrl()}/api/tasks`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throwIfPlanLimit(response.status, errorText);
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const data = (await response.json()) as CreateTaskApiResponse;
  if (data.status === "error") {
    throw new Error(data.error || "Unknown error occurred");
  }

  const tasks = data.tasks;
  if (!tasks?.length) {
    throw new Error("API returned success but no task was created");
  }

  return tasks[0];
}
