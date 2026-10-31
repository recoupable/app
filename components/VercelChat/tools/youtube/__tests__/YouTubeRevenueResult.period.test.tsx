// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatDate } from "@/lib/utils/formatDate";
import YouTubeRevenueResult from "../YouTubeRevenueResult";

const network = vi.fn(() => {
  throw new Error("Revenue presentation tests must not request the network");
});

beforeEach(() => vi.stubGlobal("fetch", network));
afterEach(() => {
  try {
    cleanup();
    expect(network).not.toHaveBeenCalled();
  } finally {
    vi.unstubAllGlobals();
    network.mockClear();
  }
});

const reports = [
  {
    name: "a historical custom range with sparse reported days",
    range: { startDate: "2026-01-01", endDate: "2026-03-31" },
    days: [
      { date: "2026-01-02", revenue: 1 },
      { date: "2026-01-15", revenue: 2 },
      { date: "2026-02-01", revenue: 3 },
      { date: "2026-02-08", revenue: 4 },
      { date: "2026-02-19", revenue: 5 },
      { date: "2026-03-01", revenue: 6 },
      { date: "2026-03-12", revenue: 7 },
      { date: "2026-03-20", revenue: 8 },
      { date: "2026-03-30", revenue: 9 },
    ],
    total: 45,
    metrics: ["$45.00", "$9.00", "$5.00"],
    coverage: "9 reported days",
    recent: ["$3.00", "$4.00", "$5.00", "$6.00", "$7.00", "$8.00", "$9.00"],
  },
  {
    name: "a thirty-day range with one reported zero day",
    range: { startDate: "2026-03-01", endDate: "2026-03-30" },
    days: [{ date: "2026-03-12", revenue: 0 }],
    total: 0,
    metrics: ["$0.00", "$0.00", "$0.00"],
    coverage: "1 reported day",
    recent: ["$0.00"],
  },
];

describe.each(reports)("Revenue report captions for $name", (report) => {
  it("preserves reported values and range without claiming a calendar span from row count", () => {
    render(
      <YouTubeRevenueResult
        result={{
          success: true,
          status: "success",
          revenueData: {
            totalRevenue: report.total,
            dailyRevenue: report.days,
            dateRange: report.range,
            channelId: "synthetic-channel",
            isMonetized: true,
          },
        }}
      />,
    );

    expect(screen.getByText("Reported period")).toBeTruthy();
    expect(screen.queryByText("Past 30 days")).toBeNull();
    expect(screen.queryByText(/Last 7 Days/i)).toBeNull();
    expect(screen.getByText(report.coverage)).toBeTruthy();
    expect(
      screen.getByText(
        `${formatDate(report.range.startDate)} - ${formatDate(report.range.endDate)}`,
      ),
    ).toBeTruthy();

    for (const label of ["Total Revenue", "Best Day", "Daily Average"]) {
      expect(screen.getByText(label)).toBeTruthy();
    }

    expect(
      screen.getByRole("heading", { name: "Recent daily revenue" }),
    ).toBeTruthy();
    expect(
      screen.getAllByText(/^\$/).map((amount) => amount.textContent),
    ).toEqual([...report.metrics, ...report.recent]);
  });
});
