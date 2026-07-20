import { describe, expect, it } from "vitest";
import { markArtistHasNoSocials } from "@/lib/onboarding/markArtistHasNoSocials";
import type { SocialsVerificationState } from "@/lib/onboarding/socialVerificationTypes";

describe("markArtistHasNoSocials", () => {
  it("sets the explicit none flag for an unseen artist", () => {
    const next = markArtistHasNoSocials({}, "artist-1");
    expect(next["artist-1"]).toEqual({ verdicts: {}, none: true });
  });

  it("resets any existing verdicts — none supersedes them", () => {
    const state: SocialsVerificationState = {
      "artist-1": {
        verdicts: { "social-1": "confirmed", "social-2": "rejected" },
        none: false,
      },
    };
    const next = markArtistHasNoSocials(state, "artist-1");
    expect(next["artist-1"]).toEqual({ verdicts: {}, none: true });
  });

  it("does not mutate the input state", () => {
    const state: SocialsVerificationState = {
      "artist-1": { verdicts: { s: "confirmed" }, none: false },
    };
    markArtistHasNoSocials(state, "artist-1");
    expect(state["artist-1"].none).toBe(false);
  });

  it("leaves other artists untouched", () => {
    const state: SocialsVerificationState = {
      "artist-2": { verdicts: { s: "confirmed" }, none: false },
    };
    const next = markArtistHasNoSocials(state, "artist-1");
    expect(next["artist-2"]).toEqual({
      verdicts: { s: "confirmed" },
      none: false,
    });
  });
});
