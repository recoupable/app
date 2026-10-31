export interface TemplateRequest {
  path?: string;
  method?: "GET" | "POST" | "PATCH" | "DELETE" | "PUT";
  body?: unknown;
}

/** The API derives ownership from the bearer; no client identity is sent. */
export async function requestAgentTemplates<T>(
  apiBaseUrl: string,
  token: string,
  signal: AbortSignal,
  { path = "", method = "GET", body }: TemplateRequest = {},
): Promise<T> {
  const response = await fetch(`${apiBaseUrl}/api/agents/templates${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    signal,
  });
  const data = await response.json();
  if (!response.ok || data.status !== "success")
    throw new Error(data.error || "Unable to update agents. Please try again.");
  return data as T;
}
