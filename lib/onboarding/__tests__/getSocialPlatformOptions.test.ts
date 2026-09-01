import { describe, expect, it } from "vitest";
import { getSocialPlatformOptions } from "@/lib/onboarding/getSocialPlatformOptions";

describe("getSocialPlatformOptions", () => {
  it("offers the platforms reports actually pull from", () => {
    const slugs = getSocialPlatformOptions().map((o) => o.slug);

    expect(slugs).toContain("spotify");
    expect(slugs).toContain("instagram");
    expect(slugs).toContain("twitter");
    expect(slugs).toContain("youtube");
    expect(slugs).toContain("tiktok");
  });

  it("marks Spotify as the one platform with a typeahead", () => {
    const options = getSocialPlatformOptions();
    const spotify = options.find((o) => o.slug === "spotify");
    const instagram = options.find((o) => o.slug === "instagram");

    // SocialFixForm used to guide everyone to Spotify (chat#1889); the others
    // have no search endpoint, so they get a platform-specific paste prompt.
    expect(spotify?.supportsSearch).toBe(true);
    expect(instagram?.supportsSearch).toBe(false);
  });

  it("gives every platform its own paste placeholder naming that platform", () => {
    for (const option of getSocialPlatformOptions()) {
      expect(option.placeholder.toLowerCase()).toContain(
        option.label.toLowerCase(),
      );
    }
  });
});
