import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

/**
 * Cancels the in-flight workflow run for a chat via recoup-api
 * `POST /api/chat/{chatId}/stop`.
 *
 * The client AI SDK `stop()` only aborts the local fetch; the durable
 * workflow run keeps streaming (and billing) server-side until it's
 * cancelled here. Callers should fire this without blocking the UI stop.
 *
 * @param chatId - Chat row id (the workflow run is keyed off it).
 * @param accessToken - Privy access token; omitted when unauthenticated.
 * @returns Resolves once the request settles; never throws.
 */
export async function stopChatWorkflow(
  chatId: string,
  accessToken: string | null,
): Promise<void> {
  try {
    await fetch(
      `${getClientApiBaseUrl()}/api/chat/${encodeURIComponent(chatId)}/stop`,
      {
        method: "POST",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      },
    );
  } catch {
    // Best-effort: the run also self-cancels when its slot is cleared.
  }
}
