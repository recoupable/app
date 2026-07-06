import { describe, expect, it } from "vitest";
import { isArtistCatalogMatch } from "@/lib/home/isArtistCatalogMatch";

const makeSong = (artists: unknown[]) => ({ artists }) as never;

describe("isArtistCatalogMatch", () => {
  it("matches when the catalog name contains the artist name (case-insensitive)", () => {
    expect(
      isArtistCatalogMatch({
        catalogName: "Del Water Gap Catalog",
        artistName: "del water gap",
        songs: [],
      }),
    ).toBe(true);
  });

  it("matches when a song's artists include the artist (object shape)", () => {
    expect(
      isArtistCatalogMatch({
        catalogName: "[TEST] verification",
        artistName: "Del Water Gap",
        songs: [makeSong([{ name: "Del Water Gap" }])],
      }),
    ).toBe(true);
  });

  it("matches when a song's artists include the artist (string shape)", () => {
    expect(
      isArtistCatalogMatch({
        catalogName: "[TEST] verification",
        artistName: "Del Water Gap",
        songs: [makeSong(["Del Water Gap"])],
      }),
    ).toBe(true);
  });

  it("does not match null-linked songs (unenriched catalogs match nobody)", () => {
    expect(
      isArtistCatalogMatch({
        catalogName: "[TEST] verification",
        artistName: "Ana Bárbara",
        songs: [makeSong([null]), makeSong([null])],
      }),
    ).toBe(false);
  });

  it("does not match a different artist", () => {
    expect(
      isArtistCatalogMatch({
        catalogName: "[TEST] verification",
        artistName: "Ana Bárbara",
        songs: [makeSong([{ name: "Del Water Gap" }])],
      }),
    ).toBe(false);
  });

  it("does not match while songs are unknown", () => {
    expect(
      isArtistCatalogMatch({
        catalogName: "[TEST] verification",
        artistName: "Ana Bárbara",
        songs: undefined,
      }),
    ).toBe(false);
  });
});
