import { describe, expect, it } from "vitest";
import { getSafeSpotifyUrl } from "../getSafeSpotifyUrl";

describe("getSafeSpotifyUrl", () => {
  it.each([
    [
      "https://open.spotify.com/track/synthetic?si=a%2Bb#details",
      "https://open.spotify.com/track/synthetic?si=a%2Bb#details",
    ],
    [
      "https://play.spotify.com/artist/synthetic",
      "https://play.spotify.com/artist/synthetic",
    ],
    ["https://accounts.spotify.com/", "https://accounts.spotify.com/"],
    [
      "HTTPS://OPEN.SPOTIFY.COM/album/synthetic",
      "https://open.spotify.com/album/synthetic",
    ],
    [
      "https:open.spotify.com/artist/synthetic",
      "https://open.spotify.com/artist/synthetic",
    ],
    [
      "https:/open.spotify.com/artist/synthetic",
      "https://open.spotify.com/artist/synthetic",
    ],
  ])(
    "returns a canonical destination under the established policy: %s",
    (value, expected) => {
      expect(getSafeSpotifyUrl(value)).toBe(expected);
      expect(
        new URL(getSafeSpotifyUrl(value)!, "https://app.recoupable.dev/chat")
          .hostname,
      ).toBe(new URL(expected).hostname);
    },
  );

  it.each([
    undefined,
    null,
    false,
    0,
    42,
    {},
    [],
    "",
    "#",
    "not a URL",
    "javascript:void(0)",
    "data:text/html,synthetic",
    "http://open.spotify.com/track/synthetic",
    "ftp://open.spotify.com/track/synthetic",
    "//open.spotify.com/track/synthetic",
    "/track/synthetic",
    "https://spotify.com/",
    "https://notspotify.com/",
    "https://open.spotify.com.evil.test/",
    "https://open.spotify.com@evil.test/",
    "https://open.spotіfy.com/",
    "https://[malformed/",
  ])("rejects malformed or unsupported tool data: %j", (value) => {
    expect(getSafeSpotifyUrl(value)).toBeUndefined();
  });
});
