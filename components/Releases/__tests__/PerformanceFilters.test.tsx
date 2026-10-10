// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import ReleaseDateFilter from "../ReleaseDateFilter";
import ReleaseTrackFilter from "../ReleaseTrackFilter";
import { data } from "./streamPanelFixture";
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
it("searches track names and identifiers and selects several recordings", () => {
  const change = vi.fn();
  render(
    <ReleaseTrackFilter
      tracks={[
        { title: "Wish", isrc: "USABC2600001" },
        { title: "Butterflies", isrc: "USABC2600002" },
      ]}
      selected={["USABC2600001"]}
      onChange={change}
    />,
  );
  fireEvent.change(screen.getByLabelText("Search tracks"), {
    target: { value: "Butter" },
  });
  expect(screen.queryByLabelText(/Wish/)).toBeNull();
  fireEvent.click(screen.getByLabelText(/Butterflies/));
  expect(change).toHaveBeenCalledWith(["USABC2600001", "USABC2600002"]);
});
it("applies inclusive custom dates and offers longer presets", () => {
  render(<ReleaseDateFilter data={data} />);
  fireEvent.click(screen.getByRole("button", { name: "Last 90 days" }));
  expect(data.setDays).toHaveBeenCalledWith(90);
  fireEvent.change(screen.getByLabelText("Start date"), {
    target: { value: "2026-08-01" },
  });
  fireEvent.change(screen.getByLabelText("End date"), {
    target: { value: "2026-08-14" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Apply dates" }));
  expect(data.setRange).toHaveBeenCalledWith("2026-08-01", 14);
});
