// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useStreamRecovery } from "@/hooks/useStreamRecovery";

const isStreaming = vi.hoisted(() => vi.fn());
vi.mock("@/lib/chat/probeChatIsStreaming", () => ({
  probeChatIsStreaming: isStreaming,
}));
vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({ getAccessToken: async () => "token" }),
}));

const flush = () => vi.advanceTimersByTimeAsync(0);

describe("useStreamRecovery", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    isStreaming.mockReset();
    isStreaming.mockResolvedValue(true);
  });
  afterEach(() => vi.useRealTimers());

  const setup = (resumeStream: () => Promise<void>, status = "ready", stop = vi.fn()) =>
    renderHook(() =>
      useStreamRecovery({
        sessionId: "session-1",
        chatId: "chat-1",
        status,
        resumeStream,
        stop,
      }),
    );

  const setupStreaming = (resumeStream: () => Promise<void>, stop = vi.fn()) =>
    renderHook(() =>
      useStreamRecovery({
        sessionId: "session-1",
        chatId: "chat-1",
        status: "streaming",
        resumeStream,
        stop,
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

  /**
   * The stall this PR exists to end. A run can finish — or be killed — without
   * the client ever receiving a `finish` chunk, and once the run is terminal
   * the resume route 204s, so that chunk is unreachable forever. Without a
   * terminal state `useChat` stays in-flight and the composer keeps a stop
   * control indefinitely (observed on preview 7f504929).
   */
  it("ends the turn when the stream closed and the run is gone", async () => {
    const resumeStream = vi.fn().mockResolvedValue(undefined);
    const stop = vi.fn();
    isStreaming.mockResolvedValue(false);
    const { result } = setupStreaming(resumeStream, stop);

    result.current();
    await flush();

    expect(resumeStream).not.toHaveBeenCalled();
    expect(stop).toHaveBeenCalledTimes(1);
  });

  /**
   * The failure mode this trigger could introduce if it fired too eagerly:
   * ending a turn that is still generating turns a stall into silent
   * truncation, which is worse because it looks like a complete answer.
   */
  it("never ends a turn while the server still reports it streaming", async () => {
    const resumeStream = vi.fn().mockResolvedValue(undefined);
    const stop = vi.fn();
    isStreaming.mockResolvedValue(true);
    const { result } = setupStreaming(resumeStream, stop);

    result.current();
    await flush();

    expect(resumeStream).toHaveBeenCalledTimes(1);
    expect(stop).not.toHaveBeenCalled();
  });

  it("does not end the turn from a browser event", async () => {
    const resumeStream = vi.fn().mockResolvedValue(undefined);
    const stop = vi.fn();
    isStreaming.mockResolvedValue(false);
    setup(resumeStream, "ready", stop);

    window.dispatchEvent(new Event("focus"));
    await flush();

    expect(stop).not.toHaveBeenCalled();
  });

  /**
   * Caught on preview 9b445ed0: `resumeStream()` does not settle until the
   * resumed stream ends, so holding the probe's in-flight flag across it
   * blocked recovery for the whole ~120s connection. The next stream end was
   * swallowed and the turn truncated while the run was still generating.
   */
  it("can recover again while an earlier resume is still streaming", async () => {
    let settleResume: () => void = () => {};
    const resumeStream = vi.fn(() => new Promise<void>(res => { settleResume = res; }));
    const { result } = setupStreaming(resumeStream);

    result.current();
    await flush();
    expect(resumeStream).toHaveBeenCalledTimes(1);

    // The resumed stream is still open — a second stream end must still work.
    result.current();
    await flush();
    expect(resumeStream).toHaveBeenCalledTimes(2);

    settleResume();
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
