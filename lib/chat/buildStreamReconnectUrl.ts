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
 *   to read the response from the beginning.
 * @returns The absolute resume URL.
 */
export function buildStreamReconnectUrl(
  api: string,
  chatId: string,
  lastChunkIndex: number | null,
): string {
  const base = `${api}/${chatId}/stream`;
  return lastChunkIndex === null ? base : `${base}?startIndex=${lastChunkIndex + 1}`;
}
