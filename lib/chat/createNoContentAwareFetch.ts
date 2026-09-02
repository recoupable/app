/**
 * Wrap `fetch` so a `204 No Content` is surfaced as a body-less response.
 *
 * `WorkflowChatTransport`'s resume loop guards on `if (!res.ok || !res.body)`.
 * A `204` fails BOTH tests: it is in the 2xx range so `res.ok` is true, and
 * the browser hands back a non-null but empty `ReadableStream`. The loop
 * therefore does not throw — it parses an empty stream, never sees a `finish`
 * chunk, leaves `gotFinish` false, and re-enters `while (!gotFinish)`
 * immediately. No error, no delay, forever (recoupable/app#2052).
 *
 * Verified against the preview on 2026-09-02: an authenticated
 * `GET /api/chat/{id}/stream?startIndex=0` returns `status: 204, ok: true,
 * body: ReadableStream`, and the loop logged no error at all while issuing
 * ~3 requests a second.
 *
 * Re-presenting it with a null body makes `!res.body` true, so the library
 * raises its own `Failed to fetch chat: 204`, which `is204NothingToResume`
 * then recognises as the end of the road.
 *
 * @param inner - The fetch to delegate to; defaults to the global.
 * @returns A fetch with the same signature.
 */
export function createNoContentAwareFetch(inner: typeof fetch = fetch): typeof fetch {
  return async (input, init) => {
    const response = await inner(input, init);
    if (response.status !== 204) return response;

    // `Response` forbids a body on 204, so this cannot round-trip through the
    // constructor with the original status — build it null-bodied and keep the
    // status visible on the object the library reads.
    return new Response(null, {
      status: 204,
      statusText: response.statusText,
      headers: response.headers,
    });
  };
}
