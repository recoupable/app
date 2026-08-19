import { describe, expect, it } from "vitest";
import { getSpotifyIdFromUrl } from "@/lib/artist/getSpotifyIdFromUrl";

describe("getSpotifyIdFromUrl", () => {
  it("extracts the artist id from a full url", () => {
    expect(getSpotifyIdFromUrl("https://open.spotify.com/artist/0PnRhcaedk9vk6q3IGte2S")).toBe(
      "0PnRhcaedk9vk6q3IGte2S",
    );
  });

  it("extracts from a normalized url with a query string", () => {
    expect(getSpotifyIdFromUrl("open.spotify.com/artist/70ANZII0p7JCQ4ArAesCbA?si=x")).toBe(
      "70ANZII0p7JCQ4ArAesCbA",
    );
  });

  it("returns null for non-artist spotify urls and other hosts", () => {
    expect(getSpotifyIdFromUrl("https://open.spotify.com/track/123")).toBeNull();
    expect(getSpotifyIdFromUrl("https://instagram.com/artist/nova")).toBeNull();
  });
});
