import { useCallback, useEffect, useRef } from "react";
/** Statuses that mean chunks are, or are about to be, arriving. */
const IN_FLIGHT = new Set(["streaming", "submitted"]);
import { getStreamRecoveryDecision } from "@/lib/chat/getStreamRecoveryDecision";
import { fetchChatIsStreaming } from "@/lib/chat/fetchChatIsStreaming";

interface UseStreamRecoveryOptions {
  /** Session owning the chat — part of the probe URL. */
  sessionId?: string;
  /** Api-minted chat id to probe for. */
  chatId: string;
  /** Current `useChat` status. */
  status: string;
  /** `resumeStream` from `useChat`; reconnects to the run's stream. */
  resumeStream: () => Promise<void> | void;
  /** Bearer token for the probe — same auth as every other call. */
  getAccessToken: () => Promise<string | null>;
}

/**
 * Reconnect a chat whose stream dropped while the tab was away.
 *
 * Ported from open-agents' `useStreamRecovery`
 * (apps/web/app/sessions/[sessionId]/chats/[chatId]/hooks/use-stream-recovery.ts):
 * recovery runs on browser events — visibilitychange, focus, online — and asks
 * the server before reconnecting, since a cut-off stream and a finished one
 * look identical from the client.
 *
 * There is deliberately no polling and no stall timer. Upstream disables its
 * stall path outright, and our interval version drove `resumeStream()` — which
 * *opens a stream* — on a cadence, producing 16 reconnects for one turn
 * (chat#1923). A stream that dies mid-turn on a focused tab is a server defect
 * and is fixed there, not papered over here.
 */
export function useStreamRecovery({
  sessionId,
  chatId,
  status,
  resumeStream,
  getAccessToken,
}: UseStreamRecoveryOptions): void {
  const lastRecoveryAtRef = useRef(0);
  const isProbeInFlightRef = useRef(false);

  // Held in a ref so the listener effect never re-registers mid-stream.
  const recoverRef = useRef<
    (opts?: { isVisibilityRecovery?: boolean; isStreamEnd?: boolean }) => void
  >(() => {});
  recoverRef.current = (opts?: {
    isVisibilityRecovery?: boolean;
    isStreamEnd?: boolean;
  }) => {
    if (!sessionId) return;

    const now = Date.now();
    const decision = getStreamRecoveryDecision({
      now,
      lastRecoveryAt: lastRecoveryAtRef.current,
      status,
      isProbeInFlight: isProbeInFlightRef.current,
      isVisibilityRecovery: opts?.isVisibilityRecovery,
      isStreamEnd: opts?.isStreamEnd,
    });
    if (decision === "none") return;

    lastRecoveryAtRef.current = now;

    if (decision === "retry-error") {
      void resumeStream();
      return;
    }

    isProbeInFlightRef.current = true;
    void (async () => {
      try {
        const isStreaming = await fetchChatIsStreaming({
          sessionId,
          chatId,
          getAccessToken,
        });
        if (isStreaming) await resumeStream();
      } catch {
        // Transient failure — the next event will try again.
      } finally {
        isProbeInFlightRef.current = false;
      }
    })();
  };

  // Stream-end trigger. A connection to the workflow stream is capped at
  // ~120 s and ends with a clean `[DONE]` — byte-identical to a finished turn
  // (chat#1928) — so the end of a stream is a question, not an answer. The
  // browser events below never fire for someone sitting on the tab, which is
  // exactly when a long turn goes quiet, so this is the trigger that covers it.
  // It fires once per connection (~1 per 2 min), bounded by the cap itself.
  const wasInFlightRef = useRef(IN_FLIGHT.has(status));
  useEffect(() => {
    const wasInFlight = wasInFlightRef.current;
    wasInFlightRef.current = IN_FLIGHT.has(status);
    if (wasInFlight && !IN_FLIGHT.has(status)) recoverRef.current({ isStreamEnd: true });
  }, [status]);

  const recover = useCallback(() => recoverRef.current(), []);
  const recoverOnVisibility = useCallback(
    () => recoverRef.current({ isVisibilityRecovery: true }),
    [],
  );

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") recoverOnVisibility();
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", recoverOnVisibility);
    window.addEventListener("online", recover);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", recoverOnVisibility);
      window.removeEventListener("online", recover);
    };
  }, [recover, recoverOnVisibility]);
}
