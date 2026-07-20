import { describe, expect, it } from "vitest";
import { isArtistSocialsResolved } from "@/lib/onboarding/isArtistSocialsResolved";

describe("isArtistSocialsResolved", () => {
  it("is false when the artist has no verification entry", () => {
    expect(isArtistSocialsResolved(undefined, ["s1"])).toBe(false);
  });

  it("is false for an artist with zero socials until none is explicit", () => {
    expect(isArtistSocialsResolved(undefined, [])).toBe(false);
    expect(isArtistSocialsResolved({ verdicts: {}, none: true }, [])).toBe(
      true,
    );
  });

  it("is true when explicit none is recorded regardless of socials", () => {
    expect(
      isArtistSocialsResolved({ verdicts: {}, none: true }, ["s1", "s2"]),
    ).toBe(true);
  });

  it("is false while any social lacks a verdict", () => {
    expect(
      isArtistSocialsResolved({ verdicts: { s1: "confirmed" }, none: false }, [
        "s1",
        "s2",
      ]),
    ).toBe(false);
  });

  it("is false when every verdict is rejected (needs explicit none)", () => {
    expect(
      isArtistSocialsResolved(
        { verdicts: { s1: "rejected", s2: "rejected" }, none: false },
        ["s1", "s2"],
      ),
    ).toBe(false);
  });

  it("is true when all socials have verdicts and at least one is confirmed", () => {
    expect(
      isArtistSocialsResolved(
        { verdicts: { s1: "confirmed", s2: "rejected" }, none: false },
        ["s1", "s2"],
      ),
    ).toBe(true);
  });

  it("ignores stale verdicts for socials no longer on the artist", () => {
    expect(
      isArtistSocialsResolved(
        { verdicts: { gone: "confirmed" }, none: false },
        ["s1"],
      ),
    ).toBe(false);
  });
});
