import { describe, it, expect } from "vitest";
import {
  shouldResumeStream,
  STREAM_RESUME_COOLDOWN_MS,
} from "@/lib/chat/shouldResumeStream";

const base = {
  now: 100_000,
  isStreamingOnServer: true,
  isReceiving: false,
  lastAttemptAt: 0,
  isAttemptInFlight: false,
  consecutiveFailures: 0,
};

describe("shouldResumeStream", () => {
  // The whole point of the rewrite: the server is the only party that can
  // tell a cut-off stream from a finished one, so ask it and believe it.
  it("resumes when the server says the chat is streaming and we are not receiving", () => {
    expect(shouldResumeStream(base)).toBe(true);
  });

  it("does not resume once the server says the chat is not streaming", () => {
    expect(shouldResumeStream({ ...base, isStreamingOnServer: false })).toBe(false);
  });

  // Reconnecting while chunks are arriving is what produced 12 concurrent
  // reads and 12,146 re-downloaded chunks on preview chat-1eerhhswj.
  it("does not resume while chunks are still arriving", () => {
    expect(shouldResumeStream({ ...base, isReceiving: true })).toBe(false);
  });

  it("does not stack attempts", () => {
    expect(shouldResumeStream({ ...base, isAttemptInFlight: true })).toBe(false);
  });

  it("honours the cooldown between attempts", () => {
    expect(shouldResumeStream({ ...base, lastAttemptAt: base.now - 1_000 })).toBe(false);
    expect(
      shouldResumeStream({ ...base, lastAttemptAt: base.now - STREAM_RESUME_COOLDOWN_MS - 1 }),
    ).toBe(true);
  });

  // A run that has gone away makes every reconnect throw; without a ceiling
  // the client retried indefinitely, still going five minutes after the turn.
  it("gives up after repeated failures rather than retrying forever", () => {
    expect(shouldResumeStream({ ...base, consecutiveFailures: 2 })).toBe(true);
    expect(shouldResumeStream({ ...base, consecutiveFailures: 3 })).toBe(false);
  });
});
