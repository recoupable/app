import { z } from "zod";
import type { Conversation } from "@/types/Chat";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

/**
 * Wire shape of each row from recoup-api `GET /api/chats`, validated at
 * the boundary. Mirrors the `ChatRoom` schema in
 * recoupable/docs#227 — every chat is joined to its parent session, so
 * `sessionId` is always present and consumers can build the canonical
 * `/sessions/{sessionId}/chats/{id}` URL directly. `artistId` reflects
 * the session's artist linkage (null when the session was created
 * without an artist context).
 */
const apiChatRowSchema = z.object({
  id: z.string(),
  title: z.string(),
  accountId: z.string(),
  sessionId: z.string(),
  artistId: z.string().nullable(),
  updatedAt: z.string(),
});

const apiChatsResponseSchema = z.object({
  status: z.string().optional(),
  chats: z.array(apiChatRowSchema).default([]),
});

/**
 * Fetches the caller's chats and projects each row into the local
 * `Conversation` shape that the sidebar consumes. Maps the api's
 * camelCase wire fields onto the snake_case fields the UI has used.
 *
 * Authentication is via Bearer token (Privy access token). The account
 * is inferred from the token — `account_id` is intentionally not sent
 * (personal tokens 403 on that filter).
 *
 * Pass `artistAccountId` to scope the response to a single artist
 * context (filters on `sessions.artist_id` server-side). Omit it to
 * list every chat the caller owns.
 *
 * Response payload is validated against the documented schema at the
 * boundary — a malformed row (missing/wrongly typed field) raises and
 * we fall back to `[]` rather than letting bad data flow into the UI.
 *
 * @see https://docs.recoupable.dev/api-reference/chat/chats
 */
const getConversations = async (
  accessToken: string,
  artistAccountId?: string,
): Promise<Conversation[]> => {
  if (!accessToken) {
    return [];
  }

  try {
    const url = new URL(`${getClientApiBaseUrl()}/api/chats`);
    if (artistAccountId) {
      url.searchParams.set("artist_account_id", artistAccountId);
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Failed to fetch conversations. HTTP ${response.status}: ${errorText}`,
      );
      return [];
    }

    const parsed = apiChatsResponseSchema.parse(await response.json());
    return parsed.chats.map(
      (row): Conversation => ({
        id: row.id,
        topic: row.title,
        sessionId: row.sessionId,
        account_id: row.accountId,
        artist_id: row.artistId ?? undefined,
        updated_at: row.updatedAt,
      }),
    );
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
};

export default getConversations;
