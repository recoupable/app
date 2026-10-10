// @vitest-environment jsdom
import React from "react";
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { history, release } from "./streamFixture";
import ReleaseStreamPanel from "../ReleaseStreamPanel";
vi.mock("next/dynamic", () => ({ default: () => () => <p>Chart loaded</p> }));
const data = {
  catalogs: [{ id: "preview-catalog", name: "Sample catalog" }],
  catalogId: "preview-catalog",
  selectCatalog: vi.fn(),
  days: 28,
  setDays: vi.fn(),
  catalogsLoading: false,
  catalogError: "",
  history,
  tracking: {
    catalog_id: "preview-catalog",
    tracking: { enabled: true },
    latest_run: { status: "complete", finished_at: null },
  },
  error: "",
  loading: false,
  enabling: false,
  mutationError: "",
  enable: vi.fn(),
  retryCatalogs: vi.fn(),
  refresh: vi.fn(),
};
afterEach(cleanup);
it("shows a release total and switches to the exact selected recording", () => {
  render(<ReleaseStreamPanel current={release} data={data} />);
  expect(
    screen.getByText("Worldwide · All reporting DSPs · Luminate"),
  ).toBeTruthy();
  expect(screen.getByText("Chart loaded")).toBeTruthy();
  expect(screen.getByLabelText("Stream recording")).toBeTruthy();
  fireEvent.change(screen.getByLabelText("Stream recording"), {
    target: { value: "USABC2600001" },
  });
  expect(screen.getByText("Chart loaded")).toBeTruthy();
  expect(screen.getByText("Daily tracking on · 09:00 UTC")).toBeTruthy();
});
it("gaps do not render numeric release totals, and tracking is explicitly catalog-wide", () => {
  const missing = structuredClone(history);
  missing.recordings[0].days.pop();
  render(
    <ReleaseStreamPanel
      current={release}
      data={{
        ...data,
        history: missing,
        tracking: { ...data.tracking, tracking: null },
      }}
    />,
  );
  expect(screen.getByText(/1 of 28 days unavailable/)).toBeTruthy();
  expect(screen.getAllByText("Unavailable")).toHaveLength(2);
  expect(
    screen.getByText(/every recording in the selected catalog/),
  ).toBeTruthy();
  fireEvent.click(
    screen.getByRole("button", { name: "Enable daily tracking" }),
  );
  expect(data.enable).toHaveBeenCalled();
});
