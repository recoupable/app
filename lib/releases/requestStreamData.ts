import { API_PUBLIC_BASE_URL } from "@/lib/consts";

/** Reuse the viewer's existing access; never expose provider credentials or raw errors. */
export async function requestStreamData(
  path: string,
  getAccessToken: () => Promise<string | null>,
  signal: AbortSignal,
  body?: { action: "enable" },
): Promise<unknown> {
  const token = await getAccessToken();
  signal.throwIfAborted();
  if (!token) throw new Error("Please sign in again to view streams.");
  // Release cases use the canonical context API, including in app previews.
  const response = await fetch(`${API_PUBLIC_BASE_URL}/api/${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
    signal: AbortSignal.any([signal, AbortSignal.timeout(30000)]),
  });
  if (response.status === 401)
    throw new Error("Please sign in again to view streams.");
  if (response.status === 403 || response.status === 404)
    throw new Error("Stream data is unavailable in this workspace.");
  if (!response.ok) throw new Error("Could not load streams. Please retry.");
  return response.json();
}
