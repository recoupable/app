import { describe, expect, it } from "vitest";
import { findArtistCatalog } from "@/lib/home/findArtistCatalog";
import type { Catalog } from "@/types/Catalog";

const makeCatalog = (id: string, name: string): Catalog => ({
  id,
  name,
  created_at: "2026-07-06T00:00:00Z",
  updated_at: "2026-07-06T00:00:00Z",
});

const catalogs = [
  makeCatalog("catalog-1", "Ana Bárbara Catalog"),
  makeCatalog("catalog-2", "Del Water Gap Catalog"),
];

describe("findArtistCatalog", () => {
  it("returns undefined when there are no catalogs", () => {
    expect(findArtistCatalog([], "Del Water Gap")).toBeUndefined();
    expect(findArtistCatalog(undefined, "Del Water Gap")).toBeUndefined();
  });

  it("returns the first catalog when no artist name is given", () => {
    expect(findArtistCatalog(catalogs, null)?.id).toBe("catalog-1");
    expect(findArtistCatalog(catalogs, undefined)?.id).toBe("catalog-1");
  });

  it("prefers the catalog whose name contains the artist name (case-insensitive)", () => {
    expect(findArtistCatalog(catalogs, "del water gap")?.id).toBe("catalog-2");
  });

  it("falls back to the first catalog when no name matches", () => {
    expect(findArtistCatalog(catalogs, "September Mourning")?.id).toBe(
      "catalog-1",
    );
  });
});
