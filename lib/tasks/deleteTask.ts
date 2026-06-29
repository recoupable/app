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
 * Missing or empty token still issues a request; the API enforces auth.
 * @see https://docs.recoupable.dev/tasks/delete
 */
export async function deleteTask(
  accessToken: string | null | undefined,
  params: DeleteTaskParams,
): Promise<void> {
  const token = accessToken ?? "";
  const response = await fetch(`${getClientApiBaseUrl()}/api/tasks`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
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
