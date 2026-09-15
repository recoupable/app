import { describe, expect, it } from "vitest";
import { getProfileSetupArtists } from "../getProfileSetupArtists";
import { getOnboardingStep } from "../getOnboardingStep";
import type { ArtistRecord } from "@/types/Artist";
const roster = [
  { account_id: "connected", account_socials: [{ id: "social" }] },
  { account_id: "missing", account_socials: [] },
] as ArtistRecord[];
describe("profile setup scope", () => {
  it("does not send a connected artist back to socials because another artist is missing", () => {
    const artists = getProfileSetupArtists(roster, {
      account_id: "connected",
      name: "Connected artist",
      account_socials: [],
    } as ArtistRecord);
    expect(
      getOnboardingStep({
        artists,
        catalogs: [{}],
        tasks: [{ enabled: true }],
      }),
    ).toBe("complete");
  });
  it("retains the roster-wide setup check for All artists", () => {
    expect(
      getOnboardingStep({
        artists: getProfileSetupArtists(roster, null),
        catalogs: [{}],
        tasks: [{ enabled: true }],
      }),
    ).toBe("socials");
  });
});
