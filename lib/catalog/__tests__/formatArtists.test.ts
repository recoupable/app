import { describe, it, expect } from "vitest";
import { formatArtists } from "@/lib/catalog/formatArtists";
import { CatalogSongsResponse } from "@/lib/catalog/getCatalogSongs";

type Artists = CatalogSongsResponse["songs"][0]["artists"];

// The API's left join emits null entries for songs with no artist rows
// (e.g. fresh valuation-claimed catalogs), so runtime data can contain
// null elements and null names despite the declared type.
const asArtists = (value: unknown): Artists => value as Artists;

describe("formatArtists", () => {
  it("returns em dash when artists is undefined", () => {
    expect(formatArtists(asArtists(undefined))).toBe("—");
  });

  it("returns em dash when artists is empty", () => {
    expect(formatArtists(asArtists([]))).toBe("—");
  });

  it("does not throw and returns em dash when artists contains only null", () => {
    expect(() => formatArtists(asArtists([null]))).not.toThrow();
    expect(formatArtists(asArtists([null]))).toBe("—");
  });

  it("returns em dash when every artist has a null or blank name", () => {
    expect(
      formatArtists(
        asArtists([
          { id: "1", name: null, timestamp: "2026-01-01" },
          { id: "2", name: "  ", timestamp: "2026-01-01" },
        ]),
      ),
    ).toBe("—");
  });

  it("skips null entries but keeps valid artist names", () => {
    expect(
      formatArtists(
        asArtists([
          null,
          { id: "1", name: "Artist A", timestamp: "2026-01-01" },
        ]),
      ),
    ).toBe("Artist A");
  });

  it("joins multiple valid artist names with a comma", () => {
    expect(
      formatArtists(
        asArtists([
          { id: "1", name: "Artist A", timestamp: "2026-01-01" },
          { id: "2", name: "Artist B", timestamp: "2026-01-01" },
        ]),
      ),
    ).toBe("Artist A, Artist B");
  });
});
