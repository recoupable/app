import { beforeEach, describe, expect, it, vi } from "vitest";
import { addSpotifyArtist } from "@/lib/artists/addSpotifyArtist";
import { createRosterArtist } from "@/lib/artists/createRosterArtist";
import saveArtist from "@/lib/saveArtist";

vi.mock("@/lib/artists/createRosterArtist", () => ({
  createRosterArtist: vi.fn(),
}));
vi.mock("@/lib/saveArtist", () => ({ default: vi.fn() }));

const spotifyArtist = {
  id: "0xPoVNPnxIIUS1vrxAYV00",
  name: "Del Water Gap",
  imageUrl: "https://i.scdn.co/image/big",
  profileUrl: "https://open.spotify.com/artist/0xPoVNPnxIIUS1vrxAYV00",
  followers: 317952,
};

describe("addSpotifyArtist", () => {
  const token = "tok";
  const created = { id: "acc-1", account_id: "acc-1", name: "Del Water Gap" };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createRosterArtist).mockResolvedValue(created as never);
    vi.mocked(saveArtist).mockResolvedValue({
      artist: { ...created, image: spotifyArtist.imageUrl },
    } as never);
  });

  it("creates the artist by name then links its Spotify image + profile URL", async () => {
    const result = await addSpotifyArtist(token, spotifyArtist, "org-1");

    expect(createRosterArtist).toHaveBeenCalledWith(
      token,
      "Del Water Gap",
      "org-1",
    );
    expect(saveArtist).toHaveBeenCalledWith(token, "acc-1", {
      image: "https://i.scdn.co/image/big",
      profileUrls: { SPOTIFY: spotifyArtist.profileUrl },
    });
    expect(result.account_id).toBe("acc-1");
  });

  it("omits the image when the Spotify result has none", async () => {
    await addSpotifyArtist(token, { ...spotifyArtist, imageUrl: null });
    expect(saveArtist).toHaveBeenCalledWith(token, "acc-1", {
      profileUrls: { SPOTIFY: spotifyArtist.profileUrl },
    });
  });
});
