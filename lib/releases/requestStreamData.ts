import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

/** Reuse the viewer's existing access; never expose provider credentials or raw errors. */
export async function requestStreamData(
  path: string,
  getAccessToken: () => Promise<string | null>,
  signal: AbortSignal,
  body?: { action: "enable" },
): Promise<unknown> {
  const token = await getAccessToken().catch(() => {
    signal.throwIfAborted();
    throw new Error("Please sign in again to view streams.");
  });
  signal.throwIfAborted();
  if (!token) throw new Error("Please sign in again to view streams.");
  const controller = new AbortController();
  const cancel = () => controller.abort(signal.reason);
  signal.addEventListener("abort", cancel, { once: true });
  const timeout = setTimeout(
    () => controller.abort(new Error("Stream request timed out")),
    30000,
  );
  try {
    const response = await fetch(`${getClientApiBaseUrl()}/api/${path}`, {
      method: body ? "POST" : "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
      signal: controller.signal,
    });
    if (response.status === 401)
      throw new Error("Please sign in again to view streams.");
    if (response.status === 403 || response.status === 404)
      throw new Error("Stream data is unavailable in this workspace.");
    if (!response.ok) throw new Error("Could not load streams. Please retry.");
    const result: unknown = await response.json();
    if (
      result &&
      typeof result === "object" &&
      "status" in result &&
      result.status === "error"
    )
      throw new Error("Could not load streams. Please retry.");
    return result;
  } catch (error) {
    if (signal.aborted) throw error;
    const safeMessages = [
      "Please sign in again to view streams.",
      "Stream data is unavailable in this workspace.",
    ];
    if (error instanceof Error && safeMessages.includes(error.message))
      throw error;
    throw new Error("Could not load streams. Please retry.");
  } finally {
    clearTimeout(timeout);
    signal.removeEventListener("abort", cancel);
  }
}
