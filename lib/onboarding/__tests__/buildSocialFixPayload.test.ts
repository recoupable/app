import { describe, expect, it } from "vitest";
import { buildSocialFixPayload } from "@/lib/onboarding/buildSocialFixPayload";

describe("buildSocialFixPayload", () => {
  it("builds a PATCH profileUrls payload keyed by detected platform", () => {
    expect(buildSocialFixPayload("https://instagram.com/laequis")).toEqual({
      platform: "INSTAGRAM",
      profileUrls: { INSTAGRAM: "https://instagram.com/laequis" },
    });
  });

  it("detects platforms from bare domains without a scheme", () => {
    expect(buildSocialFixPayload("tiktok.com/@laequis")).toEqual({
      platform: "TIKTOK",
      profileUrls: { TIKTOK: "tiktok.com/@laequis" },
    });
  });

  it("normalizes the misspelled APPPLE platform key to APPLE for the API", () => {
    const payload = buildSocialFixPayload(
      "https://music.apple.com/us/artist/x/123",
    );
    expect(payload).toEqual({
      platform: "APPLE",
      profileUrls: { APPLE: "https://music.apple.com/us/artist/x/123" },
    });
  });

  it("trims surrounding whitespace", () => {
    expect(buildSocialFixPayload("  https://x.com/laequis  ")).toEqual({
      platform: "TWITTER",
      profileUrls: { TWITTER: "https://x.com/laequis" },
    });
  });

  it("returns null for an unrecognized platform", () => {
    expect(buildSocialFixPayload("https://example.com/artist")).toBeNull();
  });

  it("returns null for empty input", () => {
    expect(buildSocialFixPayload("   ")).toBeNull();
  });
});
