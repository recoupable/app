import { describe, expect, it } from "vitest";
import { getArtistSpotifyId } from "@/lib/artist/getArtistSpotifyId";
import type { ArtistRecord } from "@/types/Artist";

const artist = (links: string[]): ArtistRecord =>
  ({
    account_id: "acct-1",
    name: "Nova",
    account_socials: links.map((link, i) => ({ id: `s${i}`, link })),
  }) as ArtistRecord;

describe("getArtistSpotifyId", () => {
  it("extracts the id from a spotify artist social", () => {
    expect(
      getArtistSpotifyId(artist(["https://open.spotify.com/artist/0PnRhcaedk9vk6q3IGte2S"])),
    ).toBe("0PnRhcaedk9vk6q3IGte2S");
  });

  it("handles normalized links without protocol and with query strings", () => {
    expect(
      getArtistSpotifyId(artist(["open.spotify.com/artist/70ANZII0p7JCQ4ArAesCbA?si=abc"])),
    ).toBe("70ANZII0p7JCQ4ArAesCbA");
  });

  it("skips non-artist spotify links and other platforms", () => {
    expect(
      getArtistSpotifyId(
        artist(["https://open.spotify.com/track/123", "https://instagram.com/nova"]),
      ),
    ).toBeNull();
  });

  it("returns null for an artist with no socials", () => {
    expect(getArtistSpotifyId({ account_id: "a", name: null } as ArtistRecord)).toBeNull();
  });
});
