// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import UsageChart from "@/components/UsagePage/UsageChart";

describe("UsageChart", () => {
  it("draws one bar per bucket across the period, gaps included, labelled in dollars", () => {
    const { container } = render(
      <UsageChart
        series={[
          {
            start: "2026-08-26T00:00:00.000Z",
            credits_deducted: 1300000,
            usd: "$1.30",
            events: 3,
          },
        ]}
        bucket="day"
        period={{
          from: "2026-08-25T10:00:00.000Z",
          to: "2026-08-27T10:00:00.000Z",
        }}
      />,
    );
    const bars = container.querySelectorAll("[data-bar]");
    expect(bars).toHaveLength(3);
    expect(screen.getByTitle("Aug 26: $1.30, 3 events")).toBeDefined();
    expect(screen.getByTitle("Aug 25: $0.00, 0 events")).toBeDefined();
    expect(container.textContent).not.toMatch(/1300000/);
  });

  it("renders nothing without a series", () => {
    const { container } = render(
      <UsageChart
        series={[]}
        bucket="day"
        period={{
          from: "2026-08-25T00:00:00.000Z",
          to: "2026-08-25T01:00:00.000Z",
        }}
      />,
    );
    expect(container.querySelectorAll("[data-bar]")).toHaveLength(1);
  });
});
