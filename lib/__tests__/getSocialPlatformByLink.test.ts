import { describe, expect, it } from "vitest";
import getSocialPlatformByLink from "@/lib/getSocialPlatformByLink";

const platforms = [
  ["x.com", "TWITTER"],
  ["twitter.com", "TWITTER"],
  ["instagram.com", "INSTAGRAM"],
  ["spotify.com", "SPOTIFY"],
  ["tiktok.com", "TIKTOK"],
  ["apple.com", "APPPLE"],
  ["youtube.com", "YOUTUBE"],
  ["youtu.be", "YOUTUBE"],
  ["facebook.com", "FACEBOOK"],
  ["threads.net", "THREADS"],
  ["threads.com", "THREADS"],
] as const;

describe("getSocialPlatformByLink", () => {
  it.each(platforms)(
    "recognizes the exact %s hostname and its subdomains",
    (domain, platform) => {
      for (const url of [
        `https://${domain}/artist`,
        `http://www.${domain}/artist`,
        `${domain}/artist`,
        `https://MOBILE.${domain.toUpperCase()}/Artist?from=example.com`,
        `${domain}:443/artist`,
      ]) {
        expect(getSocialPlatformByLink(url)).toBe(platform);
      }
    },
  );

  it.each(platforms)(
    "does not use mentions of %s outside the hostname",
    (domain) => {
      for (const url of [
        `https://${domain}.example.test/artist`,
        `https://not${domain}/artist`,
        `https://example.test/${domain}/artist`,
        `https://example.test/?profile=https://${domain}/artist`,
        `https://${domain}@example.test/artist`,
      ]) {
        expect(getSocialPlatformByLink(url)).toBe("NONE");
      }
    },
  );

  it.each([
    ["instagram.com/artist?redirect=https://example.test", "INSTAGRAM"],
    ["open.spotify.com/artist/synthetic#https://example.test", "SPOTIFY"],
    ["x.com/artist?next=ftp://example.test", "TWITTER"],
  ])(
    "recognizes a bare hostname when %s mentions a protocol later",
    (url, platform) => {
      expect(getSocialPlatformByLink(url)).toBe(platform);
    },
  );

  it.each([
    "https://box.com/artist",
    "",
    "   ",
    "https://",
    "https://[",
    "https://instagram.com:bad/artist",
    "https://you.tube/artist",
  ])("keeps unrelated or unparseable input %j unclassified", (url) => {
    expect(getSocialPlatformByLink(url)).toBe("NONE");
  });
});
