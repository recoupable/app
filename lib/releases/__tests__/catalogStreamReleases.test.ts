import { expect, it } from "vitest";
import { buildCatalogStreamReleases } from "../buildCatalogStreamReleases";
import { buildReleaseStreamSeries } from "../buildReleaseStreamSeries";
import { first, second, history } from "./streamSeriesFixture";
it("groups saved albums and joins history by exact ISRC, independent of review cases", () => {
  const releases = buildCatalogStreamReleases([
    { isrc: first, name: "Same title", album: "ADHD" },
    { isrc: second, name: "Same title", album: "Beautiful Tomorrow" },
  ]);
  expect(releases.map((release) => release.title)).toEqual([
    "ADHD",
    "Beautiful Tomorrow",
  ]);
  expect(
    releases.map((release) => buildReleaseStreamSeries(release, history).total),
  ).toEqual([7, 7]);
  expect(
    buildReleaseStreamSeries(
      {
        id: "all",
        title: "All",
        recordings: releases.flatMap((r) => r.recordings),
        complete: true,
      },
      history,
    ).total,
  ).toBe(14);
});
it("keeps missing album labels separate from literal fallback labels and rejects invalid identities", () => {
  const releases = buildCatalogStreamReleases([
    { isrc: first, name: null, album: null },
    { isrc: "invalid", name: "Other", album: "Unassigned recordings" },
  ]);
  expect(new Set(releases.map((r) => r.id)).size).toBe(2);
  expect(releases.find((r) => r.id === "null")?.recordings[0].title).toBe(
    first,
  );
  expect(
    buildReleaseStreamSeries(releases.find((r) => r.id !== "null")!, history)
      .total,
  ).toBeNull();
});
