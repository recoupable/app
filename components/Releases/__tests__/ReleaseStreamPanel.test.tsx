// @vitest-environment jsdom
import React from "react";
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { history, release } from "./streamFixture";
import { buildReleaseStreamSeries } from "@/lib/releases/buildReleaseStreamSeries";
import type { StreamPoint } from "@/lib/releases/streamTypes";
import ReleaseStreamPanel from "../ReleaseStreamPanel";
vi.mock("next/dynamic", () => ({
  default:
    () =>
    ({ points }: { points: StreamPoint[] }) => (
      <p data-testid="chart-points">{JSON.stringify(points)}</p>
    ),
}));
import { data } from "./streamPanelFixture";
afterEach(cleanup);
it("shows a release total and switches to the exact selected recording", () => {
  render(<ReleaseStreamPanel current={release} data={data} />);
  expect(screen.getByText(/Worldwide · All DSPs/)).toBeTruthy();
  expect(screen.getByTestId("chart-points").textContent).toBe(
    JSON.stringify(buildReleaseStreamSeries(release, history).daily),
  );
  expect(screen.getByLabelText("Search tracks")).toBeTruthy();
  fireEvent.click(screen.getByLabelText(/First song/));
  expect(screen.getByTestId("chart-points").textContent).toBe(
    JSON.stringify(
      buildReleaseStreamSeries(release, history, "USABC2600001").daily,
    ),
  );
  expect(screen.queryByText("Daily updates")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Last 7 days" }));
  expect(data.setDays).toHaveBeenCalledWith(7);
  expect(screen.queryByRole("button", { name: "Refresh streams" })).toBeNull();
  expect(screen.queryByText("Data details")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "table" }));
  expect(screen.getByRole("table")).toBeTruthy();
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

it("resets song selection when the selected catalog changes", () => {
  const { rerender } = render(
    <ReleaseStreamPanel current={release} data={data} />,
  );
  fireEvent.click(screen.getByLabelText(/First song/));
  rerender(
    <ReleaseStreamPanel
      current={release}
      data={{
        ...data,
        catalogId: "other",
        history: { ...history, catalog_id: "other" },
      }}
    />,
  );
  expect(
    (screen.getByLabelText(/First song/) as HTMLInputElement).checked,
  ).toBe(false);
  expect(screen.getByTestId("chart-points").textContent).toBe(
    JSON.stringify(buildReleaseStreamSeries(release, history).daily),
  );
});
