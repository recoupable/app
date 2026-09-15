import { describe, expect, it } from "vitest";
import { getOnboardingStep } from "../getOnboardingStep";
import { isArtistProfileReviewed } from "../isArtistProfileReviewed";
describe("profile review completion", () => {
  it("accepts a saved no-profile choice without claiming a social exists", () => {
    const artist = { account_socials: [], profile_unavailable: true };
    expect(isArtistProfileReviewed(artist)).toBe(true);
    expect(
      getOnboardingStep({
        artists: [artist],
        catalogs: [{}],
        tasks: [{ enabled: true }],
      }),
    ).toBe("complete");
  });
  it("restores the requirement after undo", () => {
    expect(
      getOnboardingStep({
        artists: [{ account_socials: [], profile_unavailable: false }],
        catalogs: [{}],
        tasks: [{ enabled: true }],
      }),
    ).toBe("socials");
  });
  it("accepts a real profile with or without a previous choice", () => {
    expect(isArtistProfileReviewed({ account_socials: [{}] })).toBe(true);
    expect(
      isArtistProfileReviewed({
        account_socials: [{}],
        profile_unavailable: true,
      }),
    ).toBe(true);
  });
});
