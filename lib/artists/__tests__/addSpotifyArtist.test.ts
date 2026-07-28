import { beforeEach, describe, expect, it, vi } from "vitest";
import { addSpotifyArtist } from "@/lib/artists/addSpotifyArtist";
import { createRosterArtist } from "@/lib/artists/createRosterArtist";
import saveArtist from "@/lib/saveArtist";
import type { SpotifyArtistSearchResult } from "@/types/spotify";

vi.mock("@/lib/artists/createRosterArtist", () => ({
  createRosterArtist: vi.fn(),
}));
vi.mock("@/lib/saveArtist", () => ({ default: vi.fn() }));

const spotifyArtist: SpotifyArtistSearchResult = {
  id: "0xPoVNPnxIIUS1vrxAYV00",
  name: "Del Water Gap",
  type: "artist",
  uri: "spotify:artist:0xPoVNPnxIIUS1vrxAYV00",
  external_urls: {
    spotify: "https://open.spotify.com/artist/0xPoVNPnxIIUS1vrxAYV00",
  },
  images: [{ url: "https://i.scdn.co/image/big", height: 640, width: 640 }],
  popularity: 60,
  genres: [],
  followers: { href: null, total: 317952 },
};

describe("addSpotifyArtist", () => {
  const token = "tok";
  const created = { id: "acc-1", account_id: "acc-1", name: "Del Water Gap" };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createRosterArtist).mockResolvedValue({ artist: created, created: true } as never);
    vi.mocked(saveArtist).mockResolvedValue({
      artist: { ...created, image: "https://i.scdn.co/image/big" },
    } as never);
  });

  // Row 8 (chat#1889): the server resolves-or-creates the canonical for the
  // Spotify id and attaches the social itself — the client no longer PATCHes
  // profileUrls, which is what minted a duplicate row per signup.
  it("passes the Spotify id to the create and never PATCHes the social", async () => {
    const result = await addSpotifyArtist(token, spotifyArtist, "org-1");

    expect(createRosterArtist).toHaveBeenCalledWith(
      token,
      "Del Water Gap",
      "org-1",
      spotifyArtist.id,
    );
    expect(saveArtist).toHaveBeenCalledWith(token, "acc-1", {
      image: "https://i.scdn.co/image/big",
    });
    expect(result.account_id).toBe("acc-1");
  });

  it("skips the image PATCH when the Spotify result has none", async () => {
    await addSpotifyArtist(token, { ...spotifyArtist, images: [] });
    expect(saveArtist).not.toHaveBeenCalled();
  });

  // A reused canonical is SHARED state (chat#1866): writing our image onto it
  // would overwrite metadata every other rostering account sees.
  it("never writes the image onto a reused canonical", async () => {
    vi.mocked(createRosterArtist).mockResolvedValue({
      artist: { id: "canonical-1", account_id: "canonical-1", name: "Del Water Gap" },
      created: false,
    } as never);

    const result = await addSpotifyArtist(token, spotifyArtist, "org-1");

    expect(saveArtist).not.toHaveBeenCalled();
    expect(result.account_id).toBe("canonical-1");
  });

  // POST /api/artists has already succeeded by the time enrichment runs, so a
  // failing PATCH must not fail the whole add: the caller would report failure
  // over an artist that exists, and picking again creates a duplicate
  // (chat#1889, same defect fixed in useAddRosterArtist).
  it("returns the created artist when enrichment fails", async () => {
    vi.mocked(saveArtist).mockRejectedValue(new Error("Forbidden"));

    const result = await addSpotifyArtist(token, spotifyArtist, "org-1");

    expect(result.account_id).toBe("acc-1");
  });
});
