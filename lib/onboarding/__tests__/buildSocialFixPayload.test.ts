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

  it.each([
    "https://instagram.com.example.test/artist",
    "https://example.test/?profile=https://instagram.com/artist",
    "https://box.com/artist",
  ])("does not create a repair payload for an unrelated host %s", (url) => {
    expect(buildSocialFixPayload(url)).toBeNull();
  });

  it("preserves a bare profile URL with an absolute URL in its query", () => {
    const url = "instagram.com/artist?redirect=https://example.test";
    expect(buildSocialFixPayload(url)).toEqual({
      platform: "INSTAGRAM",
      profileUrls: { INSTAGRAM: url },
    });
  });

  it("returns null for empty input", () => {
    expect(buildSocialFixPayload("   ")).toBeNull();
  });
});
