/** The api's "nothing to resume" answer on the reconnect stream. */
const NOTHING_TO_RESUME = "Failed to fetch chat: 204";

/**
 * Whether an error from `reconnectToStream` means "there is no in-flight turn
 * to resume" rather than a real failure.
 *
 * `@workflow/ai` reports that answer at two different depths. Inside its
 * `while (!gotFinish)` loop a 204 has no body, so the fetch throws
 * `Failed to fetch chat: 204 `; the loop swallows that and retries with no
 * delay, and only on the `maxConsecutiveErrors`-th attempt does it throw the
 * error that actually escapes — `Failed to reconnect after N consecutive
 * errors. Last error: Failed to fetch chat: 204 `.
 *
 * Matching only the head of the message therefore never fired on the error a
 * caller can see, so every reopened chat treated "nothing to resume" as a hard
 * failure and re-requested the stream forever (app#2052). Match the marker
 * anywhere in the chain instead, and keep it anchored to the status so a 401 or
 * a 500 still surfaces.
 *
 * @param error - The value thrown out of `reconnectToStream`.
 * @returns true when the underlying status was 204.
 */
export function is204NothingToResume(error: unknown): boolean {
  return error instanceof Error && error.message.includes(NOTHING_TO_RESUME);
}
