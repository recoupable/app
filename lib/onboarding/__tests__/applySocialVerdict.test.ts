import { describe, expect, it } from "vitest";
import { applySocialVerdict } from "@/lib/onboarding/applySocialVerdict";
import type { SocialsVerificationState } from "@/lib/onboarding/socialVerificationTypes";

describe("applySocialVerdict", () => {
  it("records a confirmed verdict for a new artist", () => {
    const next = applySocialVerdict({}, "artist-1", "social-1", "confirmed");
    expect(next["artist-1"]).toEqual({
      verdicts: { "social-1": "confirmed" },
      none: false,
    });
  });

  it("records a rejected verdict alongside existing verdicts", () => {
    const state: SocialsVerificationState = {
      "artist-1": { verdicts: { "social-1": "confirmed" }, none: false },
    };
    const next = applySocialVerdict(state, "artist-1", "social-2", "rejected");
    expect(next["artist-1"].verdicts).toEqual({
      "social-1": "confirmed",
      "social-2": "rejected",
    });
  });

  it("overwrites a previous verdict for the same social", () => {
    const state: SocialsVerificationState = {
      "artist-1": { verdicts: { "social-1": "rejected" }, none: false },
    };
    const next = applySocialVerdict(state, "artist-1", "social-1", "confirmed");
    expect(next["artist-1"].verdicts["social-1"]).toBe("confirmed");
  });

  it("clears an explicit none flag when any verdict is applied", () => {
    const state: SocialsVerificationState = {
      "artist-1": { verdicts: {}, none: true },
    };
    const next = applySocialVerdict(state, "artist-1", "social-1", "confirmed");
    expect(next["artist-1"].none).toBe(false);
  });

  it("does not mutate the input state", () => {
    const state: SocialsVerificationState = {
      "artist-1": { verdicts: {}, none: false },
    };
    applySocialVerdict(state, "artist-1", "social-1", "confirmed");
    expect(state["artist-1"].verdicts).toEqual({});
  });

  it("leaves other artists untouched", () => {
    const state: SocialsVerificationState = {
      "artist-2": { verdicts: { s: "rejected" }, none: false },
    };
    const next = applySocialVerdict(state, "artist-1", "social-1", "confirmed");
    expect(next["artist-2"]).toEqual({
      verdicts: { s: "rejected" },
      none: false,
    });
  });
});
