import { describe, it, expect } from "vitest";
import { buildReleaseRollups } from "../buildReleaseRollups";
import type { CatalogSong } from "../getCatalogSongs";
import type { CatalogSongMeasurement } from "../getCatalogMeasurements";

const song = (overrides: Partial<CatalogSong>): CatalogSong =>
  ({
    isrc: "ISRC1",
    name: "Song",
    album: "Album",
    notes: null,
    updated_at: "2026-01-01",
    catalog_id: "cat-1",
    artists: [],
    ...overrides,
  }) as CatalogSong;

const measurement = (
  isrc: string,
  playcount: number,
): CatalogSongMeasurement => ({
  isrc,
  title: null,
  playcount,
  measured_at: "2026-07-01T00:00:00Z",
});

describe("buildReleaseRollups", () => {
  it("groups songs by album and sums measured streams per release", () => {
    const songs = [
      song({
        isrc: "A1",
        album: "First",
        artists: [{ id: "x", name: "Artist X", timestamp: null }],
      }),
      song({ isrc: "A2", album: "First" }),
      song({ isrc: "B1", album: "Second" }),
    ];
    const releases = buildReleaseRollups(songs, [
      measurement("A1", 100),
      measurement("A2", 50),
      measurement("B1", 900),
    ]);

    expect(releases).toHaveLength(2);
    // sorted by streams descending
    expect(releases[0]).toMatchObject({
      album: "Second",
      trackCount: 1,
      measuredTrackCount: 1,
      streams: 900,
    });
    expect(releases[1]).toMatchObject({
      album: "First",
      trackCount: 2,
      measuredTrackCount: 2,
      streams: 150,
      artistNames: ["Artist X"],
    });
  });

  it("is null-safe on album, name, and null artist entries", () => {
    const songs = [
      song({
        isrc: "N1",
        album: null,
        name: null,
        artists: [
          null,
          { id: "y", name: null, timestamp: null },
        ] as unknown as CatalogSong["artists"],
      }),
    ];
    const releases = buildReleaseRollups(songs, []);
    expect(releases).toHaveLength(1);
    expect(releases[0].album).toBeNull();
    expect(releases[0].artistNames).toEqual([]);
    expect(releases[0].streams).toBe(0);
    expect(releases[0].measuredTrackCount).toBe(0);
  });

  it("counts unmeasured tracks in trackCount but not measuredTrackCount", () => {
    const songs = [
      song({ isrc: "A1", album: "One" }),
      song({ isrc: "A2", album: "One" }),
    ];
    const releases = buildReleaseRollups(songs, [measurement("A1", 10)]);
    expect(releases[0].trackCount).toBe(2);
    expect(releases[0].measuredTrackCount).toBe(1);
    expect(releases[0].streams).toBe(10);
  });

  it("returns an empty list for no songs", () => {
    expect(buildReleaseRollups([], [])).toEqual([]);
  });
});
