import { describe, it, expect } from "vitest";
import {
  shouldRecoverStalledStream,
  STREAM_STALL_MS,
  STREAM_RECOVERY_COOLDOWN_MS,
} from "@/lib/chat/shouldRecoverStalledStream";

const base = {
  status: "streaming" as const,
  now: 100_000,
  lastChunkAt: 100_000 - STREAM_STALL_MS - 1,
  lastRecoveryAt: 0,
  isRecoveryInFlight: false,
};

describe("shouldRecoverStalledStream", () => {
  it("recovers when a streaming turn has produced nothing for longer than the stall window", () => {
    expect(shouldRecoverStalledStream(base)).toBe(true);
  });

  it("does not recover while chunks are still arriving", () => {
    expect(shouldRecoverStalledStream({ ...base, lastChunkAt: base.now - 1_000 })).toBe(false);
  });

  // The turn is over; a reconnect would re-open a stream for nothing.
  it("does not recover once the turn is no longer in flight", () => {
    expect(shouldRecoverStalledStream({ ...base, status: "ready" })).toBe(false);
    expect(shouldRecoverStalledStream({ ...base, status: "error" })).toBe(false);
  });

  // `submitted` is in flight but has not streamed yet, so the server may
  // legitimately still be provisioning — the stall window still applies.
  it("recovers a submitted turn that never started streaming", () => {
    expect(shouldRecoverStalledStream({ ...base, status: "submitted" })).toBe(true);
  });

  it("holds off while a previous recovery attempt is still in flight", () => {
    expect(shouldRecoverStalledStream({ ...base, isRecoveryInFlight: true })).toBe(false);
  });

  // Without a cooldown a permanently dead stream would be retried on every
  // tick, hammering the resume route.
  it("holds off until the cooldown since the last attempt has elapsed", () => {
    expect(
      shouldRecoverStalledStream({ ...base, lastRecoveryAt: base.now - 1_000 }),
    ).toBe(false);
    expect(
      shouldRecoverStalledStream({
        ...base,
        lastRecoveryAt: base.now - STREAM_RECOVERY_COOLDOWN_MS - 1,
      }),
    ).toBe(true);
  });

  it("treats a never-seen chunk timestamp as no reason to recover yet", () => {
    expect(shouldRecoverStalledStream({ ...base, lastChunkAt: null })).toBe(false);
  });
});
