// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useStreamRecovery } from "@/hooks/useStreamRecovery";

const isStreaming = vi.hoisted(() => vi.fn());
vi.mock("@/lib/chat/fetchChatIsStreaming", () => ({
  fetchChatIsStreaming: isStreaming,
}));

const flush = () => vi.advanceTimersByTimeAsync(0);

describe("useStreamRecovery", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    isStreaming.mockReset();
    isStreaming.mockResolvedValue(true);
  });
  afterEach(() => vi.useRealTimers());

  const setup = (resumeStream: () => Promise<void>, status = "ready") =>
    renderHook(() =>
      useStreamRecovery({
        sessionId: "session-1",
        chatId: "chat-1",
        status,
        resumeStream,
        getAccessToken: async () => "token",
      }),
    );

  const setupStreaming = (resumeStream: () => Promise<void>) =>
    renderHook(() =>
      useStreamRecovery({
        sessionId: "session-1",
        chatId: "chat-1",
        status: "streaming",
        resumeStream,
        getAccessToken: async () => "token",
      }),
    );

  it("probes and reconnects when the tab regains focus", async () => {
    const resumeStream = vi.fn().mockResolvedValue(undefined);
    setup(resumeStream);

    window.dispatchEvent(new Event("focus"));
    await flush();

    expect(isStreaming).toHaveBeenCalledTimes(1);
    expect(resumeStream).toHaveBeenCalledTimes(1);
  });

  it("does not reconnect when the server says the run has ended", async () => {
    const resumeStream = vi.fn().mockResolvedValue(undefined);
    isStreaming.mockResolvedValue(false);
    setup(resumeStream);

    window.dispatchEvent(new Event("focus"));
    await flush();

    expect(isStreaming).toHaveBeenCalledTimes(1);
    expect(resumeStream).not.toHaveBeenCalled();
  });

  /**
   * The regression this replaces: recovery used to run on a 5s interval, so a
   * single dropped stream produced 12 reconnects. Nothing may fire without a
   * browser event.
   */
  it("never fires on its own without an event", async () => {
    const resumeStream = vi.fn().mockResolvedValue(undefined);
    setup(resumeStream);

    await vi.advanceTimersByTimeAsync(120_000);

    expect(isStreaming).not.toHaveBeenCalled();
    expect(resumeStream).not.toHaveBeenCalled();
  });

  it("collapses overlapping events into one recovery", async () => {
    const resumeStream = vi.fn().mockResolvedValue(undefined);
    setup(resumeStream);

    window.dispatchEvent(new Event("focus"));
    window.dispatchEvent(new Event("online"));
    window.dispatchEvent(new Event("focus"));
    await flush();

    expect(resumeStream).toHaveBeenCalledTimes(1);
  });

  /**
   * The trigger the other two could not cover. A connection to the workflow
   * stream is capped at ~120s and ends with a clean `[DONE]`, identical to a
   * finished turn (chat#1928) — so every stream end is a question, and a
   * focused tab fires no visibility/focus event to ask it.
   */
  it("probes and reconnects when the stream ends while the run is still live", async () => {
    const resumeStream = vi.fn().mockResolvedValue(undefined);
    const { result } = setupStreaming(resumeStream);

    result.current();
    await flush();

    expect(isStreaming).toHaveBeenCalledTimes(1);
    expect(resumeStream).toHaveBeenCalledTimes(1);
  });

  // The failure this trigger was moved to the transport for: on preview the
  // first drop moved `useChat`'s status and the second did not, so the turn
  // reconnected once and then froze. Every stream end must be answerable.
  it("fires on every stream end, not just the first", async () => {
    const resumeStream = vi.fn().mockResolvedValue(undefined);
    const { result } = setupStreaming(resumeStream);

    result.current();
    await flush();
    result.current();
    await flush();
    result.current();
    await flush();

    expect(resumeStream).toHaveBeenCalledTimes(3);
  });

  it("accepts the turn as finished when the stream ends and the run is done", async () => {
    const resumeStream = vi.fn().mockResolvedValue(undefined);
    isStreaming.mockResolvedValue(false);
    const { result } = setupStreaming(resumeStream);

    result.current();
    await flush();

    expect(isStreaming).toHaveBeenCalledTimes(1);
    expect(resumeStream).not.toHaveBeenCalled();
  });

  it("leaves a live stream alone", async () => {
    const resumeStream = vi.fn().mockResolvedValue(undefined);
    setup(resumeStream, "streaming");

    window.dispatchEvent(new Event("focus"));
    await flush();

    expect(isStreaming).not.toHaveBeenCalled();
    expect(resumeStream).not.toHaveBeenCalled();
  });
});
