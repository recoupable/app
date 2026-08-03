import { useEffect, useRef } from "react";
import {
  shouldRecoverStalledStream,
  STREAM_STALL_MS,
} from "@/lib/chat/shouldRecoverStalledStream";

/** How often we re-evaluate whether the stream has gone quiet. */
const POLL_MS = 3_000;

interface UseStreamRecoveryOptions {
  /** Current `useChat` status. */
  status: string;
  /**
   * True once the resume route has answered 204 for this turn. Ends probing —
   * the server is the only party that can distinguish a finished turn from a
   * cut-off one.
   */
  serverConfirmedDone: boolean;
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
  serverConfirmedDone,
  activityMarker,
  resumeStream,
}: UseStreamRecoveryOptions): void {
  const lastChunkAtRef = useRef<number | null>(null);
  const lastRecoveryAtRef = useRef(0);
  const isRecoveryInFlightRef = useRef(false);
  // When the turn last stopped looking in-flight. Opens the post-turn probe
  // window — the stream ends identically whether the turn finished or was cut
  // off, so the client cannot tell them apart without asking.
  const turnEndedAtRef = useRef<number | null>(null);
  const wasInFlightRef = useRef(false);

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
      turnEndedAtRef.current = null;
    }
  }, [status]);

  // Record the in-flight → not-in-flight edge. This is the moment the original
  // bug becomes invisible to a status-gated trigger.
  useEffect(() => {
    const inFlight = status === "streaming" || status === "submitted";
    if (wasInFlightRef.current && !inFlight) turnEndedAtRef.current = Date.now();
    wasInFlightRef.current = inFlight;
  }, [status]);

  // The evaluation itself lives in a ref so listeners keep a stable identity.
  const maybeRecoverRef = useRef<(opts?: { isVisibilityCheck?: boolean }) => void>(() => {});
  maybeRecoverRef.current = (opts) => {
    const now = Date.now();
    if (
      !shouldRecoverStalledStream({
        status,
        now,
        lastChunkAt: lastChunkAtRef.current,
        lastRecoveryAt: lastRecoveryAtRef.current,
        isRecoveryInFlight: isRecoveryInFlightRef.current,
        isVisibilityCheck: opts?.isVisibilityCheck,
        turnEndedAt: turnEndedAtRef.current,
        serverConfirmedDone,
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
      if (document.visibilityState === "visible") {
        maybeRecoverRef.current({ isVisibilityCheck: true });
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);
}

export { STREAM_STALL_MS };
