/**
 * How long a turn may produce nothing before we treat the stream as dropped.
 *
 * Not upstream's `STREAM_RECOVERY_STALL_MS = 4_000`: that value feeds a
 * scheduler their `shouldScheduleStallRecovery` unconditionally disables
 * (`return false`), so it is not a live stall threshold to copy. It also would
 * not survive our workload — a single legitimate tool call streams nothing for
 * up to ~200 s (measured on prod), so a 4 s window would fire dozens of
 * pointless reconnects per turn.
 *
 * 10 s is a deliberate tightening from the 20 s this hook shipped with, which
 * the tail-index resume makes safe: a reconnect now resumes from the exact
 * chunk we last saw rather than replaying, so an unnecessary one costs a
 * request and nothing else.
 */
export const STREAM_STALL_MS = 10_000;

/**
 * Minimum gap between reconnect attempts, so a dead stream isn't retried every
 * tick. Matches upstream's `STREAM_RECOVERY_MIN_INTERVAL_MS`.
 */
export const STREAM_RECOVERY_COOLDOWN_MS = 8_000;

/**
 * How long after a turn leaves in-flight we keep asking the server whether it
 * is really finished.
 *
 * This window exists because the failure mode ends the stream *cleanly* — a
 * `[DONE]` with no `finish` chunk — so `useChat` transitions out of
 * `streaming` and any trigger gated on in-flight status goes silent exactly
 * when the run is still going. Reproduced on prod 2026-08-03: a 123 s stream,
 * zero reconnects, and the run alive for a further 3.25 minutes.
 *
 * It is only a backstop: the first 204 from the resume route ends probing
 * immediately, so a normally-completed turn costs one extra request. The
 * window bounds the pathological case where that answer never arrives.
 */
export const POST_TURN_PROBE_MS = 5 * 60_000;

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
  /**
   * True when evaluated because the tab regained visibility, rather than on
   * the interval. A backgrounded tab can have its connection killed silently,
   * and no amount of waiting produces a chunk to time out on — so this skips
   * the silence window. Upstream's only live recovery trigger is this same
   * visibility probe.
   */
  isVisibilityCheck?: boolean;
  /**
   * When the turn last left in-flight, or `null` if no turn has run in this
   * session. Opens the post-turn probe window.
   */
  turnEndedAt?: number | null;
  /**
   * True once the resume route has answered 204 — the server saying there is
   * nothing left to resume. The only authoritative end-of-turn signal we get,
   * since the stream itself ends the same way whether the turn finished or
   * was cut off.
   */
  serverConfirmedDone?: boolean;
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
  isVisibilityCheck = false,
  turnEndedAt = null,
  serverConfirmedDone = false,
}: StreamRecoveryInput): boolean {
  if (isRecoveryInFlight) return false;
  // The server has told us there is nothing to resume. Believe it.
  if (serverConfirmedDone) return false;
  if (now - lastRecoveryAt <= STREAM_RECOVERY_COOLDOWN_MS) return false;

  // The turn looks finished to the client — but a cut-off stream and a
  // completed one are indistinguishable from here, so keep asking the server
  // for a bounded window rather than trusting the appearance.
  if (!IN_FLIGHT_STATUSES.has(status)) {
    return turnEndedAt !== null && now - turnEndedAt < POST_TURN_PROBE_MS;
  }

  // A visibility check skips the silence window but keeps the cooldown, so a
  // focus-flapping tab can't spam reconnects.
  if (isVisibilityCheck) return true;

  if (lastChunkAt === null) return false;
  if (now - lastChunkAt <= STREAM_STALL_MS) return false;

  return true;
}
