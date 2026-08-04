/** Minimum gap between recovery actions, matching upstream open-agents. */
export const STREAM_RECOVERY_MIN_INTERVAL_MS = 8_000;

export type StreamRecoveryDecision = "none" | "retry-error" | "probe";

export type StreamRecoveryInput = {
  /** `Date.now()` at evaluation time. */
  now: number;
  /** When recovery last acted (0 if never). */
  lastRecoveryAt: number;
  /** Current `useChat` status. */
  status: string;
  /** Whether a probe is already running. */
  isProbeInFlight: boolean;
  /** True when called from a visibilitychange or focus event. */
  isVisibilityRecovery?: boolean;
};

/**
 * Decide what stream recovery should do, if anything.
 *
 * Ported from open-agents' `getStreamRecoveryDecision`
 * (apps/web/app/sessions/[sessionId]/chats/[chatId]/stream-recovery-policy.ts).
 * Recovery there is event-driven — visibilitychange, focus, online — and never
 * polled. Our own polling loop is what turned a single dropped stream into 12
 * reconnects at the probe interval (chat#1923), so the cadence is gone and the
 * triggers are the browser events upstream uses.
 *
 * A probe only makes sense for an idle chat: while chunks are arriving,
 * reconnecting replays them on top of the live stream.
 *
 * @returns `"retry-error"` to reconnect directly, `"probe"` to ask the server
 *   whether the run is still live first, `"none"` to do nothing.
 */
export function getStreamRecoveryDecision({
  now,
  lastRecoveryAt,
  status,
  isProbeInFlight,
  isVisibilityRecovery = false,
}: StreamRecoveryInput): StreamRecoveryDecision {
  if (now - lastRecoveryAt < STREAM_RECOVERY_MIN_INTERVAL_MS) return "none";

  if (status === "error") return "retry-error";

  // The browser may have silently killed the connection while the tab was
  // backgrounded, so an idle-looking chat is worth asking about.
  if (isVisibilityRecovery && status === "ready") {
    return isProbeInFlight ? "none" : "probe";
  }

  return "none";
}
