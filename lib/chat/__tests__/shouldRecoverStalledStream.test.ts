import { describe, it, expect } from "vitest";
import {
  shouldRecoverStalledStream,
  STREAM_STALL_MS,
  STREAM_RECOVERY_COOLDOWN_MS,
  POST_TURN_PROBE_MS,
} from "@/lib/chat/shouldRecoverStalledStream";

const base = {
  status: "streaming" as const,
  now: 100_000,
  lastChunkAt: 100_000 - STREAM_STALL_MS - 1,
  lastRecoveryAt: 0,
  isRecoveryInFlight: false,
  turnEndedAt: null as number | null,
  serverConfirmedDone: false,
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

  // Upstream's only live trigger is a visibility probe: a backgrounded tab can
  // have its connection killed silently, and no amount of waiting will produce
  // a chunk to time out on. On visibility we skip the silence window — but the
  // cooldown still applies so a focus-flapping tab can't spam reconnects.
  it("recovers immediately on a visibility check, without waiting out the stall window", () => {
    const justStreamed = { ...base, lastChunkAt: base.now - 500 };

    expect(shouldRecoverStalledStream(justStreamed)).toBe(false);
    expect(shouldRecoverStalledStream({ ...justStreamed, isVisibilityCheck: true })).toBe(true);
  });

  it("still honours the cooldown on a visibility check", () => {
    expect(
      shouldRecoverStalledStream({
        ...base,
        lastChunkAt: base.now - 500,
        isVisibilityCheck: true,
        lastRecoveryAt: base.now - 1_000,
      }),
    ).toBe(false);
  });

  it("does not recover on a visibility check once the turn is finished", () => {
    expect(
      shouldRecoverStalledStream({ ...base, status: "ready", isVisibilityCheck: true }),
    ).toBe(false);
  });

  // THE ORIGINAL BUG. A stream that ends with a clean `[DONE]` and no `finish`
  // chunk moves useChat OUT of streaming, so a trigger gated on in-flight
  // status goes silent exactly when the run is still going. Reproduced on prod
  // 2026-08-03 after chat#1924 merged: 123 s stream, zero reconnects, run alive
  // for a further 3.25 min.
  it("recovers after the turn leaves in-flight, while the post-turn window is open", () => {
    expect(
      shouldRecoverStalledStream({
        ...base,
        status: "ready",
        turnEndedAt: base.now - 2_000,
      }),
    ).toBe(true);
  });

  it("stops probing once the post-turn window has expired", () => {
    expect(
      shouldRecoverStalledStream({
        ...base,
        status: "ready",
        turnEndedAt: base.now - POST_TURN_PROBE_MS - 1,
      }),
    ).toBe(false);
  });

  // Without this, every idle chat polls the resume route forever.
  it("does not probe a turn that never ran", () => {
    expect(shouldRecoverStalledStream({ ...base, status: "ready", turnEndedAt: null })).toBe(
      false,
    );
  });

  // The route answering 204 is the server saying "nothing to resume" — the
  // only authoritative end-of-turn signal we get.
  it("stops probing once the server has confirmed there is nothing to resume", () => {
    expect(
      shouldRecoverStalledStream({
        ...base,
        status: "ready",
        turnEndedAt: base.now - 2_000,
        serverConfirmedDone: true,
      }),
    ).toBe(false);
  });

  it("honours the cooldown on post-turn probes too", () => {
    expect(
      shouldRecoverStalledStream({
        ...base,
        status: "ready",
        turnEndedAt: base.now - 2_000,
        lastRecoveryAt: base.now - 1_000,
      }),
    ).toBe(false);
  });
});
