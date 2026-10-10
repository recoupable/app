// @vitest-environment jsdom
import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import ReleaseCaseDetails from "../ReleaseCaseDetails";
import type { ReleaseCase } from "@/lib/releases/types";
afterEach(cleanup);
const empty: ReleaseCase = {
  request_id: "request",
  title: null,
  fingerprint: "hash",
  readiness: "blocked",
  reviewable: false,
  tracks: [],
  gaps: ["Missing composition"],
  evidence_manifest: [],
  track_page: { state: "missing", hasMore: false },
  identity_observations: { state: "missing", candidates: [] },
  latest_review: null,
};
it("explains the next step without an empty table or disabled review form", () => {
  render(
    <ReleaseCaseDetails
      current={empty}
      sourceUrl="https://open.spotify.com/album/example"
      busy={false}
      onReview={vi.fn()}
      onReload={vi.fn()}
    />,
  );
  expect(screen.getByText("Your release link is saved")).toBeTruthy();
  expect(
    screen.getByText(
      /Your saved catalog recordings and charts remain available above/,
    ),
  ).toBeTruthy();
  expect(screen.queryByRole("table")).toBeNull();
  expect(screen.queryByLabelText("Review note")).toBeNull();
  expect(
    screen.getByRole("link", { name: "Open release on Spotify" }),
  ).toBeTruthy();
});
it("keeps source limitations secondary and explicit", () => {
  render(
    <ReleaseCaseDetails
      current={empty}
      sourceUrl="https://open.spotify.com/album/example"
      busy={false}
      onReview={vi.fn()}
      onReload={vi.fn()}
    />,
  );
  expect(
    screen
      .getByText("Sources and coverage")
      .closest("details")
      ?.hasAttribute("open"),
  ).toBe(false);
  expect(screen.getByText("Missing composition")).toBeTruthy();
});
