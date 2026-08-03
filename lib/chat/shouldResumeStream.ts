/** Minimum gap between resume attempts. */
export const STREAM_RESUME_COOLDOWN_MS = 8_000;

/**
 * How many consecutive failed attempts before we stop trying.
 *
 * A run that has gone away makes every reconnect throw, and without a ceiling
 * the client retried indefinitely — still going five minutes after the turn
 * ended, on preview `chat-1eerhhswj`.
 */
export const MAX_CONSECUTIVE_RESUME_FAILURES = 3;

export type ResumeDecision = {
  /** `Date.now()` at evaluation time. */
  now: number;
  /** What the server says: `ChatSummary.isStreaming` for this chat. */
  isStreamingOnServer: boolean;
  /** Whether chunks are currently arriving on an open read. */
  isReceiving: boolean;
  /** When we last attempted a resume (0 if never). */
  lastAttemptAt: number;
  /** Whether an attempt is already running. */
  isAttemptInFlight: boolean;
  /** Failed attempts since the last successful one. */
  consecutiveFailures: number;
};

/**
 * Decide whether to reconnect to a chat's response stream.
 *
 * One rule, gated on the server's own answer. A cut-off stream and a completed
 * one are indistinguishable from the client — both end with `[DONE]` and no
 * `finish` chunk — so the client stops guessing from silence or status and
 * asks `GET /api/sessions/{sessionId}/chats` instead, which already reports
 * `isStreaming` per chat and carries no message bodies.
 *
 * This replaces three separate triggers (stall-on-silence, visibility, and a
 * post-turn window). Each was defensible alone; together they drove a
 * *stream-opening* operation on a polling cadence and produced 24 reconnects
 * re-downloading 12,146 chunks for a ~4,000-chunk turn (chat#1923). The probe
 * is what makes a single cheap trigger possible: asking costs one small JSON
 * response, and only a `yes` opens a stream.
 *
 * @param input - Server state, local receive state, and attempt bookkeeping.
 * @returns True when a resume should be attempted now.
 */
export function shouldResumeStream({
  now,
  isStreamingOnServer,
  isReceiving,
  lastAttemptAt,
  isAttemptInFlight,
  consecutiveFailures,
}: ResumeDecision): boolean {
  if (!isStreamingOnServer) return false;
  if (isReceiving) return false;
  if (isAttemptInFlight) return false;
  if (consecutiveFailures >= MAX_CONSECUTIVE_RESUME_FAILURES) return false;
  if (now - lastAttemptAt <= STREAM_RESUME_COOLDOWN_MS) return false;

  return true;
}
