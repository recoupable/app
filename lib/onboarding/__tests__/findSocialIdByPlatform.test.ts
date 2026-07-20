import { describe, expect, it } from "vitest";
import { findSocialIdByPlatform } from "@/lib/onboarding/findSocialIdByPlatform";
import type { SOCIAL } from "@/types/Agent";

const social = (id: string, type: string, link: string): SOCIAL =>
  ({ id, type, link }) as SOCIAL;

describe("findSocialIdByPlatform", () => {
  const socials = [
    social("s-ig", "INSTAGRAM", "https://instagram.com/a"),
    social("s-tw", "TWITTER", "https://x.com/a"),
  ];

  it("finds the social id for a platform", () => {
    expect(findSocialIdByPlatform(socials, "TWITTER")).toBe("s-tw");
  });

  it("returns null when no social matches", () => {
    expect(findSocialIdByPlatform(socials, "TIKTOK")).toBeNull();
  });

  it("matches APPLE against the legacy APPPLE type spelling", () => {
    const apple = [social("s-ap", "APPPLE", "https://music.apple.com/a")];
    expect(findSocialIdByPlatform(apple, "APPLE")).toBe("s-ap");
  });

  it("returns null for an empty list", () => {
    expect(findSocialIdByPlatform([], "INSTAGRAM")).toBeNull();
  });
});
