import { useEffect, useRef } from "react";
import {
  shouldResumeStream,
  MAX_CONSECUTIVE_RESUME_FAILURES,
} from "@/lib/chat/shouldResumeStream";
import { fetchChatIsStreaming } from "@/lib/chat/fetchChatIsStreaming";

/** How often we ask the server whether this chat is still streaming. */
const PROBE_INTERVAL_MS = 5_000;

interface UseStreamRecoveryOptions {
  /** Session owning the chat — part of the probe URL. */
  sessionId?: string;
  /** Api-minted chat id to probe for. */
  chatId: string;
  /** Current `useChat` status; `streaming` means chunks are arriving. */
  status: string;
  /** `resumeStream` from `useChat`; reconnects to the run's stream. */
  resumeStream: () => Promise<void> | void;
  /** Bearer token for the probe — same auth as every other call. */
  getAccessToken: () => Promise<string | null>;
}

/**
 * Reconnect a chat turn whose stream dropped, by asking the server whether the
 * run is still going.
 *
 * A dropped stream and a finished one are indistinguishable from the client:
 * both end with `[DONE]` and no `finish` chunk, and `useChat` leaves
 * `streaming` either way. So this stops inferring from silence or status and
 * asks instead — `GET /api/sessions/{sessionId}/chats` already reports
 * `isStreaming` per chat and carries no message bodies — resuming only on a
 * `yes`.
 *
 * That answer is what makes a single trigger affordable. `resumeStream()`
 * *opens a stream*, so it can never itself be the poll: attaching a cadence to
 * it produced 24 reconnects re-downloading 12,146 chunks for a ~4,000-chunk
 * turn (chat#1923).
 */
export function useStreamRecovery({
  sessionId,
  chatId,
  status,
  resumeStream,
  getAccessToken,
}: UseStreamRecoveryOptions): void {
  const lastAttemptAtRef = useRef(0);
  const isAttemptInFlightRef = useRef(false);
  const failuresRef = useRef(0);

  // Live values via a ref so the interval effect never re-registers.
  const stateRef = useRef({ sessionId, chatId, status, resumeStream, getAccessToken });
  stateRef.current = { sessionId, chatId, status, resumeStream, getAccessToken };

  // A new turn clears the failure budget, so a previous dead run cannot
  // suppress recovery for the next one.
  useEffect(() => {
    if (status === "submitted") {
      failuresRef.current = 0;
      lastAttemptAtRef.current = 0;
    }
  }, [status]);

  useEffect(() => {
    const tick = async () => {
      const { sessionId: sid, chatId: cid, status: st, resumeStream: resume } = stateRef.current;
      if (!sid) return;

      // Cheap local rejections first — never spend a probe when the answer
      // cannot change the outcome.
      if (
        isAttemptInFlightRef.current ||
        st === "streaming" ||
        failuresRef.current >= MAX_CONSECUTIVE_RESUME_FAILURES
      ) {
        return;
      }

      const isStreamingOnServer = await fetchChatIsStreaming({
        sessionId: sid,
        chatId: cid,
        getAccessToken: stateRef.current.getAccessToken,
      });
      // A failed probe is not a failed resume — try again next tick rather
      // than spending the failure budget on it.
      if (isStreamingOnServer === null) return;

      if (
        !shouldResumeStream({
          now: Date.now(),
          isStreamingOnServer,
          isReceiving: st === "streaming",
          lastAttemptAt: lastAttemptAtRef.current,
          isAttemptInFlight: isAttemptInFlightRef.current,
          consecutiveFailures: failuresRef.current,
        })
      ) {
        return;
      }

      lastAttemptAtRef.current = Date.now();
      isAttemptInFlightRef.current = true;
      try {
        await resume();
        failuresRef.current = 0;
      } catch {
        failuresRef.current += 1;
      } finally {
        isAttemptInFlightRef.current = false;
      }
    };

    const interval = setInterval(() => void tick(), PROBE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);
}
