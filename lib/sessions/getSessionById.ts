import { z } from "zod";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

/**
 * Wire shape of recoup-api `GET /api/sessions/{sessionId}`, validated at
 * the boundary. Only `session.artistId` is consumed here (to resolve the
 * active artist when opening a canonical session chat URL), so the schema
 * is intentionally narrow and ignores the rest of the payload.
 */
const sessionResponseSchema = z.object({
  session: z.object({
    artistId: z.string().nullable(),
  }),
});

export type GetSessionByIdResponse = z.infer<typeof sessionResponseSchema>;

const errorResponseSchema = z.object({ error: z.string() }).partial();

/**
 * Fetches a single session from recoup-api `GET /api/sessions/{sessionId}`.
 * Used to resolve `artistId` when opening a canonical session chat URL.
 */
export async function getSessionById(
  sessionId: string,
  recoupAccessToken: string,
): Promise<GetSessionByIdResponse> {
  const response = await fetch(
    `${getClientApiBaseUrl()}/api/sessions/${encodeURIComponent(sessionId)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${recoupAccessToken}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const rawBody = await response.text().catch(() => "");
    const parsed = errorResponseSchema.safeParse(safeJsonParse(rawBody));
    const message =
      (parsed.success ? parsed.data.error : undefined) ??
      "Failed to fetch session";
    throw new Error(message);
  }

  return sessionResponseSchema.parse(await response.json());
}

function safeJsonParse(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
