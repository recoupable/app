import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

export type UpdateChatParams = {
  accessToken: string;
  sessionId: string;
  chatId: string;
  title: string;
};

export type UpdateChatResponse = {
  status?: "success" | "error";
  chat?: {
    id: string;
    sessionId: string;
    title: string;
    modelId: string | null;
    activeStreamId: string | null;
    createdAt: string;
    updatedAt: string;
  };
  error?: string;
};

/**
 * Renames (or otherwise patches) a session-scoped chat via recoup-api
 * `PATCH /api/sessions/{sessionId}/chats/{chatId}`. Returns the updated
 * row under `{ chat }`.
 */
export async function updateChat({
  accessToken,
  sessionId,
  chatId,
  title,
}: UpdateChatParams): Promise<UpdateChatResponse> {
  const response = await fetch(
    `${getClientApiBaseUrl()}/api/sessions/${encodeURIComponent(sessionId)}/chats/${encodeURIComponent(chatId)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ title }),
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}) as { error?: string });
    throw new Error(error.error || "Failed to update chat");
  }

  return response.json();
}
