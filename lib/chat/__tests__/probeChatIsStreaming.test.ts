import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  probeChatIsStreaming,
  STREAM_END_PROBE_DELAYS_MS,
} from "@/lib/chat/probeChatIsStreaming";

const isStreaming = vi.hoisted(() => vi.fn());
vi.mock("@/lib/chat/fetchChatIsStreaming", () => ({
  fetchChatIsStreaming: isStreaming,
}));

const args = {
  sessionId: "session-1",
  chatId: "chat-1",
  getAccessToken: async () => "token",
};

describe("probeChatIsStreaming", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    isStreaming.mockReset();
  });
  afterEach(() => vi.useRealTimers());

  it("returns true on the first yes without further asking", async () => {
    isStreaming.mockResolvedValue(true);

    const result = probeChatIsStreaming(args);
    await vi.runAllTimersAsync();

    await expect(result).resolves.toBe(true);
    expect(isStreaming).toHaveBeenCalledTimes(1);
  });

  /**
   * The defect this exists for: `isStreaming` reads false for a moment at an
   * iteration boundary while the run is very much alive — measured on preview,
   * where a probe said no at 410s and yes again at 452s, 1,412 chunks later.
   * One "no" is not proof the turn ended.
   */
  it("keeps asking across the schedule and resumes on a later yes", async () => {
    isStreaming.mockResolvedValueOnce(false).mockResolvedValueOnce(false).mockResolvedValue(true);

    const result = probeChatIsStreaming(args);
    await vi.runAllTimersAsync();

    await expect(result).resolves.toBe(true);
    expect(isStreaming).toHaveBeenCalledTimes(3);
  });

  it("gives up after the budget so a finished turn is accepted", async () => {
    isStreaming.mockResolvedValue(false);

    const result = probeChatIsStreaming(args);
    await vi.runAllTimersAsync();

    await expect(result).resolves.toBe(false);
    expect(isStreaming).toHaveBeenCalledTimes(STREAM_END_PROBE_DELAYS_MS.length);
  });

  // A failed probe is not a "no" — it is an unanswered question, so it keeps asking.
  it("treats a failed probe as unanswered and retries", async () => {
    isStreaming.mockResolvedValueOnce(null).mockResolvedValue(true);

    const result = probeChatIsStreaming(args);
    await vi.runAllTimersAsync();

    await expect(result).resolves.toBe(true);
    expect(isStreaming).toHaveBeenCalledTimes(2);
  });

  it("asks exactly once when given a single-step schedule", async () => {
    isStreaming.mockResolvedValue(false);

    const result = probeChatIsStreaming({ ...args, delaysMs: [0] });
    await vi.runAllTimersAsync();

    await expect(result).resolves.toBe(false);
    expect(isStreaming).toHaveBeenCalledTimes(1);
  });
});
