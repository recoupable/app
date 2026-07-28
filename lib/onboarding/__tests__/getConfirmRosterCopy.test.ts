import { describe, expect, it } from "vitest";
import { getConfirmRosterCopy } from "@/lib/onboarding/getConfirmRosterCopy";

describe("getConfirmRosterCopy", () => {
  it("prompts an empty roster to search Spotify", () => {
    const copy = getConfirmRosterCopy({ artistCount: 0, hasValuation: false });

    expect(copy).toMatch(/search spotify/i);
  });

  it("credits the valuation only when one actually ran", () => {
    expect(
      getConfirmRosterCopy({ artistCount: 1, hasValuation: true }),
    ).toMatch(/this artist up from your valuation/i);
    expect(
      getConfirmRosterCopy({ artistCount: 2, hasValuation: true }),
    ).toMatch(/these artists up from your valuation/i);
  });

  // Two-thirds of welcome-email signups never ran a valuation. Crediting one
  // is false for them the moment they add their first artist by typeahead —
  // which is the only path this cohort has (chat#1889).
  it("never claims a valuation the account never ran", () => {
    for (const artistCount of [1, 2, 5]) {
      const copy = getConfirmRosterCopy({ artistCount, hasValuation: false });

      expect(copy).not.toMatch(/valuation/i);
      expect(copy).toMatch(/verify their socials next/i);
    }
  });
});
