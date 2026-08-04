import { describe, it, expect } from "vitest";
import {
  getStreamRecoveryDecision,
  STREAM_RECOVERY_MIN_INTERVAL_MS,
} from "@/lib/chat/getStreamRecoveryDecision";

const base = {
  now: 100_000,
  lastRecoveryAt: 0,
  status: "ready",
  isProbeInFlight: false,
  isVisibilityRecovery: true,
};

describe("getStreamRecoveryDecision", () => {
  it("probes when the tab comes back and the chat looks idle", () => {
    expect(getStreamRecoveryDecision(base)).toBe("probe");
  });

  // Recovery is event-driven, not polled. Without this guard, `online` and
  // `focus` firing together would drive two reconnects for one event.
  it("stays silent inside the minimum interval", () => {
    expect(
      getStreamRecoveryDecision({
        ...base,
        lastRecoveryAt: base.now - STREAM_RECOVERY_MIN_INTERVAL_MS + 1,
      }),
    ).toBe("none");
  });

  it("retries directly when the chat is in an error state", () => {
    expect(getStreamRecoveryDecision({ ...base, status: "error" })).toBe(
      "retry-error",
    );
  });

  // A probe is only meaningful for an idle chat: while chunks are arriving,
  // reconnecting replays them on top of the live stream.
  it("does not probe while the chat is streaming or submitting", () => {
    expect(getStreamRecoveryDecision({ ...base, status: "streaming" })).toBe(
      "none",
    );
    expect(getStreamRecoveryDecision({ ...base, status: "submitted" })).toBe(
      "none",
    );
  });

  it("does not probe on non-visibility events", () => {
    expect(
      getStreamRecoveryDecision({ ...base, isVisibilityRecovery: false }),
    ).toBe("none");
  });

  it("does not stack probes", () => {
    expect(
      getStreamRecoveryDecision({ ...base, isProbeInFlight: true }),
    ).toBe("none");
  });
});
