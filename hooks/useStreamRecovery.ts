import { useEffect, useRef } from "react";
import {
  shouldRecoverStalledStream,
  STREAM_STALL_MS,
} from "@/lib/chat/shouldRecoverStalledStream";

/** How often we re-evaluate whether the stream has gone quiet. */
const POLL_MS = 5_000;

interface UseStreamRecoveryOptions {
  /** Current `useChat` status. */
  status: string;
  /**
   * Changes whenever the assistant produces output. Any value that moves as
   * chunks arrive works — the hook only reads it to timestamp "last activity".
   */
  activityMarker: unknown;
  /** `resumeStream` from `useChat`; reconnects to the run's stream. */
  resumeStream: () => Promise<void> | void;
}

/**
 * Reconnect a chat turn whose stream dropped mid-run.
 *
 * A long turn's SSE response can end before the workflow does: on prod
 * 2026-08-02 the connection closed with a clean `[DONE]` and no `finish`
 * chunk, so `useChat` stopped rendering while the run went on to complete
 * 7 more iterations. Nothing surfaced that — no error, no retry — and the
 * only recovery was a page refresh (chat#1923).
 *
 * Watches for silence on an in-flight turn and calls `resumeStream()`, which
 * reconnects via `GET /api/chat/{chatId}/stream`. Also re-checks when the tab
 * regains visibility, since a backgrounded tab is where drops are most likely
 * and least likely to be noticed.
 */
export function useStreamRecovery({
  status,
  activityMarker,
  resumeStream,
}: UseStreamRecoveryOptions): void {
  const lastChunkAtRef = useRef<number | null>(null);
  const lastRecoveryAtRef = useRef(0);
  const isRecoveryInFlightRef = useRef(false);

  // Timestamp activity. Kept in a ref so the polling effect never re-registers
  // as output streams in.
  useEffect(() => {
    lastChunkAtRef.current = Date.now();
  }, [activityMarker]);

  // Reset between turns so a previous turn's timings can't trigger a recovery
  // on the next one.
  useEffect(() => {
    if (status === "submitted") {
      lastChunkAtRef.current = Date.now();
      lastRecoveryAtRef.current = 0;
    }
  }, [status]);

  // The evaluation itself lives in a ref so listeners keep a stable identity.
  const maybeRecoverRef = useRef(() => {});
  maybeRecoverRef.current = () => {
    const now = Date.now();
    if (
      !shouldRecoverStalledStream({
        status,
        now,
        lastChunkAt: lastChunkAtRef.current,
        lastRecoveryAt: lastRecoveryAtRef.current,
        isRecoveryInFlight: isRecoveryInFlightRef.current,
      })
    ) {
      return;
    }

    lastRecoveryAtRef.current = now;
    isRecoveryInFlightRef.current = true;

    void (async () => {
      try {
        await resumeStream();
      } catch (error) {
        // A failed reconnect is not fatal — the next tick tries again, and a
        // finished run resolves to 204 which ends the loop naturally.
        console.error("[useStreamRecovery] resumeStream failed:", error);
      } finally {
        isRecoveryInFlightRef.current = false;
      }
    })();
  };

  useEffect(() => {
    const interval = setInterval(() => maybeRecoverRef.current(), POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") maybeRecoverRef.current();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);
}

export { STREAM_STALL_MS };
