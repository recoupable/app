import { describe, expect, it } from "vitest";
import { areAllArtistsResolved } from "@/lib/onboarding/areAllArtistsResolved";
import type { SocialsVerificationState } from "@/lib/onboarding/socialVerificationTypes";

describe("areAllArtistsResolved", () => {
  const state: SocialsVerificationState = {
    "artist-1": { verdicts: { s1: "confirmed" }, none: false },
    "artist-2": { verdicts: {}, none: true },
  };

  it("is true when every artist is resolved", () => {
    expect(
      areAllArtistsResolved(state, [
        { artistId: "artist-1", socialIds: ["s1"] },
        { artistId: "artist-2", socialIds: [] },
      ]),
    ).toBe(true);
  });

  it("is false when any artist is unresolved", () => {
    expect(
      areAllArtistsResolved(state, [
        { artistId: "artist-1", socialIds: ["s1"] },
        { artistId: "artist-3", socialIds: ["s9"] },
      ]),
    ).toBe(false);
  });

  it("is vacuously true for an empty artist list", () => {
    expect(areAllArtistsResolved({}, [])).toBe(true);
  });
});
