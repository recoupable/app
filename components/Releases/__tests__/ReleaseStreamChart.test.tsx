// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import ReleaseStreamChart from "../ReleaseStreamChart";
vi.mock("recharts", () => {
  const Container = ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  );
  const Empty = () => null;
  return {
    ResponsiveContainer: Container,
    LineChart: Container,
    Legend: Empty,
    Line: Empty,
    CartesianGrid: Empty,
    XAxis: Empty,
    YAxis: Empty,
    Tooltip: ({ content }: { content: React.ReactElement }) =>
      React.cloneElement(content, {
        active: true,
        payload: [
          {
            name: "streams",
            dataKey: "streams",
            value: 0,
            payload: { date: "2026-10-01", streams: 0 },
          },
        ],
      } as React.Attributes),
  };
});
afterEach(cleanup);
it("shows observed zero streams in the shared chart tooltip", () => {
  render(
    <ReleaseStreamChart
      points={[{ date: "2026-10-01", streams: 0, observedTracks: 1 }]}
    />,
  );
  expect(screen.getByText("0 streams")).toBeTruthy();
});
