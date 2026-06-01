import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

/**
 * Soft-deletes a session by archiving it via recoup-api
 * `PATCH /api/sessions/{sessionId}` with `{ status: "archived" }`.
 *
 * The sidebar's "Delete chat" action calls this — archiving the session
 * hides all its chats from `GET /api/chats` (api filters
 * `session.status === "archived"`) and triggers the existing
 * `stopSandboxOnArchive` lifecycle path on the api side. Use this
 * instead of the previous chat-row delete so the action is reversible
 * (admin can unarchive) and cleans up sandbox state.
 */
export async function archiveSession(
  sessionId: string,
  accessToken: string,
): Promise<void> {
  const url = getClientApiBaseUrl();

  const response = await fetch(
    `${url}/api/sessions/${encodeURIComponent(sessionId)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ status: "archived" }),
    },
  );

  if (!response.ok) {
    const result = await response
      .json()
      .catch(() => ({}) as { error?: string });
    throw new Error(result.error || "Failed to archive session");
  }
}
