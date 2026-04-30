import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

export interface DeleteTaskParams {
  id: string;
}

interface DeleteTaskResponse {
  status: "success" | "error";
  error?: string;
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
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const data = (await response.json()) as DeleteTaskResponse;
  if (data.status === "error") {
    throw new Error(data.error || "Unknown error occurred");
  }
}
