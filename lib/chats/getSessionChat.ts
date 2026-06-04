import { z } from "zod";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import { safeJsonParse } from "@/lib/api/safeJsonParse";

const sessionChatResponseSchema = z.object({
  chat: z.object({
    modelId: z.string().nullable(),
  }),
});

export type GetSessionChatResponse = z.infer<typeof sessionChatResponseSchema>;

const errorResponseSchema = z.object({ error: z.string() }).partial();

/**
 * Fetches a session-scoped chat row from recoup-api
 * `GET /api/sessions/{sessionId}/chats/{chatId}` (chat metadata only).
 */
export async function getSessionChat(
  sessionId: string,
  chatId: string,
  accessToken: string,
): Promise<GetSessionChatResponse> {
  const response = await fetch(
    `${getClientApiBaseUrl()}/api/sessions/${encodeURIComponent(sessionId)}/chats/${encodeURIComponent(chatId)}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const rawBody = await response.text().catch(() => "");
    const parsed = errorResponseSchema.safeParse(safeJsonParse(rawBody));
    const message =
      (parsed.success ? parsed.data.error : undefined) ??
      "Failed to fetch chat";
    throw new Error(message);
  }

  return sessionChatResponseSchema.parse(await response.json());
}
