/**
 * How much of a turn a fresh page load asks for, as a negative (relative to
 * the end of the stream) index.
 *
 * A reload mid-turn has no counted position, so without this it resumes from
 * chunk zero and replays the whole response — 418 chunks in the verified prod
 * run, all of it already persisted and rendered from the database anyway.
 * Asking for the recent tail instead keeps the reconnect cheap.
 *
 * Negative indices are resolved by the server, which reports where the read
 * landed via `x-workflow-stream-tail-index`; that is what lets subsequent
 * retries in the same session go back to exact absolute positions.
 */
export const REFRESH_RESUME_WINDOW = -50;

interface ReconnectUrlOptions {
  /**
   * True when this is the first reconnect of a freshly loaded page, i.e. the
   * client has no counted position because it never saw any of this turn.
   */
  isFreshLoad?: boolean;
}

/**
 * Build the URL for reconnecting to a chat's in-progress response stream.
 *
 * `api` is the transport's BASE (`…/api/chat`), not the reconnect URL: the AI
 * SDK only falls back to `${api}/${id}/stream` when
 * `prepareReconnectToStreamRequest` returns no `api` of its own. Returning one
 * replaces the whole URL, so the path must be rebuilt rather than appended to
 * — appending the query to the base produced a GET against the POST-only
 * `/api/chat` and 405'd on every reconnect (chat#1923).
 *
 * @param api - The transport's base chat endpoint.
 * @param chatId - The api-minted chat id. NOT the `useChat` instance id, which
 *   for a new chat is still a client placeholder and 404s.
 * @param lastChunkIndex - Absolute index of the last chunk received, or `null`
 *   when the client has no counted position.
 * @param options - `isFreshLoad` requests a bounded tail instead of the whole
 *   turn when there is no counted position.
 * @returns The absolute resume URL.
 */
export function buildStreamReconnectUrl(
  api: string,
  chatId: string,
  lastChunkIndex: number | null,
  options: ReconnectUrlOptions = {},
): string {
  const base = `${api}/${chatId}/stream`;

  // A counted position is always better than a guess.
  if (lastChunkIndex !== null) return `${base}?startIndex=${lastChunkIndex + 1}`;

  return options.isFreshLoad ? `${base}?startIndex=${REFRESH_RESUME_WINDOW}` : base;
}
