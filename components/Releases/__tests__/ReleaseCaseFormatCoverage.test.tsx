// @vitest-environment jsdom
import { screen, cleanup } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import {
  formatCase as base,
  formatTrack as track,
  observedFormat as observed,
} from "./releaseFormatFixture";
import { renderReleaseCase as show } from "./renderReleaseCase";
afterEach(cleanup);
it("distinguishes uncollected tracks from observed format metadata", () => {
  show({
    ...base,
    tracks: [],
    release_format: {
      ...observed,
      track_coverage: "uncollected",
      disc_count: null,
      multi_disc: null,
    },
  });
  expect(
    screen.getByText(
      /^Album · Disc count unknown · 3 tracks reported · Track list not collected/,
    ),
  ).toBeTruthy();
  expect(screen.queryByText("Format not collected")).toBeNull();
  expect(screen.queryByText(/Track list incomplete/)).toBeNull();
  expect(screen.queryByText(/Disc \d ·/)).toBeNull();
});
it("does not claim a disc count when only part of the track list was collected", () => {
  show({
    ...base,
    tracks: [track(0, "First", 1, 1), track(1, "Second", 1, 2)],
    release_format: {
      ...observed,
      reported_total_tracks: 60,
      track_coverage: "partial",
      disc_count: null,
      multi_disc: null,
    },
  });
  const line = screen.getByText(
    /^Album · Disc count unknown · 60 tracks reported · Track list incomplete/,
  );
  expect(line.textContent).not.toMatch(/\d discs?\b/);
  expect(screen.queryByText(/Disc \d ·/)).toBeNull();
});
it("shows multiple discs without a count when a partial list already reaches disc 2", () => {
  show({
    ...base,
    release_format: {
      ...observed,
      track_coverage: "partial",
      disc_count: null,
      multi_disc: true,
    },
  });
  expect(
    screen.getByText(
      /^Album · Multiple discs · 3 tracks reported · Track list incomplete/,
    ),
  ).toBeTruthy();
  expect(screen.getByText(/^Disc 2 · 1\. Third/)).toBeTruthy();
});
