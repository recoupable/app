// @vitest-environment jsdom
import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import ReleaseCaseDetails from "../ReleaseCaseDetails";
import type { ReleaseCase } from "@/lib/releases/types";
import {
  formatCase as base,
  formatTrack as track,
  observedFormat as observed,
} from "./releaseFormatFixture";
afterEach(cleanup);
function show(current: ReleaseCase) {
  render(
    <ReleaseCaseDetails
      current={current}
      busy={false}
      onReview={vi.fn()}
      onReload={vi.fn()}
    />,
  );
}
it("shows the observed multi-disc album and disc prefixes without inventing a UPC", () => {
  show({ ...base, release_format: observed });
  const line = screen.getByText(/^Album · 2 discs · 3 tracks reported/);
  expect(line.textContent).toContain("UPC not observed");
  expect(line.textContent).toContain("Reissue/physical format unknown");
  expect(line.textContent).not.toMatch(/UPC \d/);
  expect(screen.getByText(/^Disc 1 · 1\. First/)).toBeTruthy();
  expect(screen.getByText(/^Disc 1 · 2\. Second/)).toBeTruthy();
  expect(screen.getByText(/^Disc 2 · 1\. Third/)).toBeTruthy();
});
it("shows a single without disc prefixes and passes an observed UPC through unchanged", () => {
  show({
    ...base,
    tracks: [track(0, "Only", 1, 1)],
    release_format: {
      ...observed,
      observed_type: "single",
      format_state: "single",
      reported_total_tracks: 1,
      disc_count: 1,
      multi_disc: false,
      label: null,
      release_date: null,
      release_date_precision: null,
      upc: "0".repeat(12),
      upc_state: "observed",
    },
  });
  const line = screen.getByText(/^Single · 1 disc · 1 track reported/);
  expect(line.textContent).toContain(`UPC ${"0".repeat(12)}`);
  expect(screen.queryByText(/Disc \d/)).toBeNull();
  expect(screen.getByText(/^1\. Only/)).toBeTruthy();
});
it("says the format was not collected when the server sends none", () => {
  show(base);
  expect(screen.getByText("Format not collected")).toBeTruthy();
  expect(screen.queryByText(/Disc \d/)).toBeNull();
  expect(screen.queryByText(/UPC/)).toBeNull();
});
it("keeps an observed but unknown type distinct from uncollected", () => {
  show({
    ...base,
    release_format: {
      ...observed,
      observed_type: null,
      format_state: "unknown",
      disc_count: null,
      multi_disc: null,
    },
  });
  expect(screen.getByText(/^Format unknown · 3 tracks reported/)).toBeTruthy();
  expect(screen.queryByText("Format not collected")).toBeNull();
  expect(screen.queryByText(/Disc \d/)).toBeNull();
});
it("treats an uncollected server block like a missing one", () => {
  show({
    ...base,
    release_format: {
      ...observed,
      state: "uncollected",
      format_state: "unknown",
      upc_state: "uncollected",
      disc_count: null,
      multi_disc: null,
    },
  });
  expect(screen.getByText("Format not collected")).toBeTruthy();
});
it("does not claim a UPC was looked for when it was not collected", () => {
  show({ ...base, release_format: { ...observed, upc_state: "uncollected" } });
  const line = screen.getByText(/^Album · 2 discs/);
  expect(line.textContent).toContain("UPC not collected");
  expect(line.textContent).not.toContain("UPC not observed");
});
