import { fetchChatIsStreaming } from "@/lib/chat/fetchChatIsStreaming";

/**
 * When to ask, in ms from the first attempt. Mirrors upstream open-agents'
 * mount probe (`delaysMs = [0, 1_000, 2_500, 5_500, 10_000]`), which exists
 * for the same class of race on the other end of a run.
 */
export const STREAM_END_PROBE_DELAYS_MS = [0, 1_000, 2_500, 5_500, 10_000];

interface ProbeChatIsStreamingOptions {
  sessionId: string;
  chatId: string;
  getAccessToken: () => Promise<string | null>;
  /** Override the schedule; `[0]` asks exactly once. */
  delaysMs?: number[];
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Ask whether a chat's run is still going, and don't take the first no for an
 * answer.
 *
 * `ChatSummary.isStreaming` reads false for a moment at an iteration boundary
 * while the run is still alive — measured on preview, where it said no at 410s
 * and yes again at 452s, 1,412 chunks later. Treating that first no as final
 * ended recovery for the rest of the turn and froze the UI, so a stream end is
 * answered across a bounded schedule instead of a single call.
 *
 * Only the *asking* repeats. The caller still reconnects at most once, so this
 * cannot reproduce the reconnect storm a probe cadence caused (chat#1923).
 *
 * @param options - Chat identity, auth, and an optional schedule.
 * @returns True as soon as the server reports the run live; false once the
 *   schedule is exhausted, which is the point we accept the turn as finished.
 */
export async function probeChatIsStreaming({
  sessionId,
  chatId,
  getAccessToken,
  delaysMs = STREAM_END_PROBE_DELAYS_MS,
}: ProbeChatIsStreamingOptions): Promise<boolean> {
  for (const [index, delay] of delaysMs.entries()) {
    if (index > 0 || delay > 0) await wait(delay);

    // `null` means the probe itself failed — an unanswered question, not a no,
    // so it does not end the schedule early.
    if ((await fetchChatIsStreaming({ sessionId, chatId, getAccessToken })) === true) {
      return true;
    }
  }

  return false;
}
