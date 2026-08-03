/** How long a turn may produce nothing before we treat the stream as dropped. */
export const STREAM_STALL_MS = 20_000;

/** Minimum gap between reconnect attempts, so a dead stream isn't retried every tick. */
export const STREAM_RECOVERY_COOLDOWN_MS = 15_000;

/** The `useChat` statuses that mean a turn is still expected to produce output. */
const IN_FLIGHT_STATUSES = new Set(["streaming", "submitted"]);

export type StreamRecoveryInput = {
  /** Current `useChat` status. */
  status: string;
  /** `Date.now()` at evaluation time. */
  now: number;
  /** When the last chunk arrived, or `null` if none has yet. */
  lastChunkAt: number | null;
  /** When we last attempted a reconnect (0 if never). */
  lastRecoveryAt: number;
  /** Whether a reconnect attempt is already running. */
  isRecoveryInFlight: boolean;
};

/**
 * Decide whether a chat turn's stream looks dropped and should be reconnected.
 *
 * A long turn's SSE stream can end before the run does — reproduced on prod
 * 2026-08-02, where the connection closed mid-run with no `finish` chunk and
 * the UI froze at 6 of 13 iterations while the workflow ran to completion
 * (chat#1923). Nothing in `useChat` notices that, so we watch for silence and
 * reconnect via the resume route.
 *
 * Deliberately silence-based rather than duration-based: a turn that is still
 * streaming is healthy no matter how long it has been running, and a turn that
 * has gone quiet is suspect even if it only just started.
 *
 * @param input - Current status, timings, and in-flight recovery state.
 * @returns True when a reconnect should be attempted now.
 */
export function shouldRecoverStalledStream({
  status,
  now,
  lastChunkAt,
  lastRecoveryAt,
  isRecoveryInFlight,
}: StreamRecoveryInput): boolean {
  if (!IN_FLIGHT_STATUSES.has(status)) return false;
  if (isRecoveryInFlight) return false;
  if (lastChunkAt === null) return false;
  if (now - lastChunkAt <= STREAM_STALL_MS) return false;
  if (now - lastRecoveryAt <= STREAM_RECOVERY_COOLDOWN_MS) return false;

  return true;
}
