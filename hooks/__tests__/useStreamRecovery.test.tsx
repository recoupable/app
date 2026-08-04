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

  it("leaves a live stream alone", async () => {
    const resumeStream = vi.fn().mockResolvedValue(undefined);
    setup(resumeStream, "streaming");

    window.dispatchEvent(new Event("focus"));
    await flush();

    expect(isStreaming).not.toHaveBeenCalled();
    expect(resumeStream).not.toHaveBeenCalled();
  });
});
