interface ChunkCountingFetchOptions {
  /** Base URL, used to resolve relative request URLs. */
  baseUrl: string;
  /**
   * Called with the absolute index of the last chunk received, or `null` when
   * a read starts from the beginning and any previous position is void.
   */
  onPosition: (index: number | null) => void;
  /**
   * Called when a read of the resume route answers 204 — the server saying
   * there is nothing left to resume. The only authoritative end-of-turn
   * signal available to the client, since a cut-off stream and a completed
   * one both end with `[DONE]`.
   */
  onNoActiveStream?: () => void;
  /** Injectable for tests; defaults to the global fetch. */
  fetchImpl?: typeof globalThis.fetch;
}

/**
 * Wrap `fetch` so we always know how far through a response stream the client
 * actually got.
 *
 * This cannot be read off a response header. Headers are sent before the body,
 * so `x-workflow-stream-tail-index` reports the tail at the moment the read
 * was OPENED — a live read advertising a tail of 9 went on to deliver 22
 * chunks. The only honest position for a long-lived read is the one counted
 * off the wire.
 *
 * A read with no `startIndex` begins at chunk zero, which voids any position
 * carried over from a previous turn or a different chat. That reset is
 * reported immediately, before the body is read, because the window between
 * issuing a request and its first frame is exactly when a stalled-stream
 * reconnect could otherwise fire with a stale index and skip chunks the client
 * never saw.
 *
 * @param options - Base URL, position callback, and an optional fetch.
 * @returns A `fetch` that streams through untouched while counting.
 */
export function createChunkCountingFetch({
  baseUrl,
  onPosition,
  onNoActiveStream,
  fetchImpl,
}: ChunkCountingFetchOptions): typeof globalThis.fetch {
  return (async (input: RequestInfo | URL, init?: RequestInit) => {
    const doFetch = fetchImpl ?? globalThis.fetch;
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;

    const startIndexParam = new URL(url, baseUrl).searchParams.get("startIndex");
    const requested = startIndexParam === null ? null : Number(startIndexParam);
    const resumesFrom =
      requested !== null && Number.isInteger(requested) && requested >= 0 ? requested : null;

    // Reading from the beginning — any earlier position no longer applies.
    if (resumesFrom === null) onPosition(null);

    const response = await doFetch(input, init);

    // 204 on the resume path means the run is genuinely over.
    if (response.status === 204 && new URL(url, baseUrl).pathname.endsWith("/stream")) {
      onNoActiveStream?.();
    }

    if (!response.body) return response;

    let index = (resumesFrom ?? 0) - 1;
    const [toCaller, toCount] = response.body.tee();

    void (async () => {
      const reader = toCount.getReader();
      const decoder = new TextDecoder();
      let buffered = "";
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffered += decoder.decode(value, { stream: true });
          const lines = buffered.split("\n");
          buffered = lines.pop() ?? "";
          for (const line of lines) {
            // `[DONE]` terminates the SSE response; it is not a stream chunk.
            if (line.startsWith("data: ") && !line.startsWith("data: [DONE]")) {
              index += 1;
              onPosition(index);
            }
          }
        }
      } catch {
        // Counting is best-effort: a torn read just means the next reconnect
        // resumes from the last index we did count, still ahead of replaying.
      } finally {
        reader.releaseLock();
      }
    })();

    return new Response(toCaller, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  }) as typeof globalThis.fetch;
}
