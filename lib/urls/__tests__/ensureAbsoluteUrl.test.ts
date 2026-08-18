import { describe, it, expect } from "vitest";
import { ensureAbsoluteUrl } from "@/lib/urls/ensureAbsoluteUrl";

describe("ensureAbsoluteUrl", () => {
  it("prefixes https:// on scheme-less URLs (the socials table stores them bare)", () => {
    expect(ensureAbsoluteUrl("open.spotify.com/artist/abc")).toBe(
      "https://open.spotify.com/artist/abc",
    );
    expect(ensureAbsoluteUrl("tiktok.com/@brauxelion")).toBe("https://tiktok.com/@brauxelion");
  });

  it("leaves absolute URLs untouched", () => {
    expect(ensureAbsoluteUrl("https://instagram.com/x")).toBe("https://instagram.com/x");
    expect(ensureAbsoluteUrl("http://legacy.example.com")).toBe("http://legacy.example.com");
  });

  it("returns an empty string unchanged", () => {
    expect(ensureAbsoluteUrl("")).toBe("");
  });
});
