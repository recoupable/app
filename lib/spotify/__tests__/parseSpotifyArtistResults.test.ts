import { describe, expect, it } from "vitest";
import { parseSpotifyArtistResults } from "@/lib/spotify/parseSpotifyArtistResults";

const item = {
  id: "0xPoVNPnxIIUS1vrxAYV00",
  name: "Del Water Gap",
  external_urls: {
    spotify: "https://open.spotify.com/artist/0xPoVNPnxIIUS1vrxAYV00",
  },
  followers: { total: 317952 },
  images: [
    { url: "https://i.scdn.co/image/big", height: 640, width: 640 },
    { url: "https://i.scdn.co/image/small", height: 160, width: 160 },
  ],
};

describe("parseSpotifyArtistResults", () => {
  it("maps the search envelope to id/name/imageUrl/profileUrl/followers", () => {
    const results = parseSpotifyArtistResults({ artists: { items: [item] } });
    expect(results).toEqual([
      {
        id: "0xPoVNPnxIIUS1vrxAYV00",
        name: "Del Water Gap",
        imageUrl: "https://i.scdn.co/image/big",
        profileUrl: "https://open.spotify.com/artist/0xPoVNPnxIIUS1vrxAYV00",
        followers: 317952,
      },
    ]);
  });

  it("uses the first (largest) image and nulls when there are none", () => {
    const noImage = { ...item, images: [] };
    const [r] = parseSpotifyArtistResults({ artists: { items: [noImage] } });
    expect(r.imageUrl).toBeNull();
  });

  it("nulls followers when the count is missing", () => {
    const noFollowers = { ...item, followers: undefined };
    const [r] = parseSpotifyArtistResults({
      artists: { items: [noFollowers] },
    });
    expect(r.followers).toBeNull();
  });

  it("falls back to a constructed profile URL when external_urls is absent", () => {
    const noUrl = { ...item, external_urls: undefined };
    const [r] = parseSpotifyArtistResults({ artists: { items: [noUrl] } });
    expect(r.profileUrl).toBe(
      "https://open.spotify.com/artist/0xPoVNPnxIIUS1vrxAYV00",
    );
  });

  it("drops items missing an id or name, and returns [] for malformed input", () => {
    expect(
      parseSpotifyArtistResults({
        artists: { items: [{ id: "x" }, { name: "y" }, item] },
      }),
    ).toHaveLength(1);
    expect(parseSpotifyArtistResults(null)).toEqual([]);
    expect(parseSpotifyArtistResults({})).toEqual([]);
  });
});
