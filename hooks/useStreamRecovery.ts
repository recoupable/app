import { useCallback, useEffect, useRef } from "react";
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
 * (chat#1923).
 *
 * Upstream's browser events are not sufficient on their own: a connection is
 * capped at ~120s (chat#1928) and someone sitting on the tab fires none of
 * them, so a long turn froze. The returned handler adds the missing trigger —
 * wire it to the transport's end-of-body.
 *
 * @returns A stable callback to invoke when a response stream ends.
 */
export function useStreamRecovery({
  sessionId,
  chatId,
  status,
  resumeStream,
  getAccessToken,
}: UseStreamRecoveryOptions): () => void {
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
  //
  // Driven from the transport's teed reader rather than from `useChat`'s
  // status: on preview a first drop moved the status and a second did not, so
  // the turn reconnected once and then froze. End-of-body is unambiguous.
  const onStreamEnd = useCallback(() => recoverRef.current({ isStreamEnd: true }), []);

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

  return onStreamEnd;
}
