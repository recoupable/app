import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

export interface GetSessionByIdResponse {
  session: {
    artistId: string | null;
  };
}

interface GetSessionByIdErrorResponse {
  error?: string;
}

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
    let parsed: GetSessionByIdErrorResponse | null = null;
    if (rawBody) {
      try {
        parsed = JSON.parse(rawBody) as GetSessionByIdErrorResponse;
      } catch {
        parsed = null;
      }
    }
    const message = parsed?.error ?? "Failed to fetch session";
    throw new Error(message);
  }

  return (await response.json()) as GetSessionByIdResponse;
}
