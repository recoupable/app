// @vitest-environment jsdom
import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import UsageChart from "@/components/UsagePage/UsageChart";

const period = {
  from: "2026-08-25T10:00:00.000Z",
  to: "2026-08-27T10:00:00.000Z",
};

// recharts' ResponsiveContainer observes its box; jsdom has no ResizeObserver.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver =
  ResizeObserverStub as unknown as typeof ResizeObserver;

describe("UsageChart", () => {
  it("feeds one point per bucket across the period, gaps included, into the shadcn chart", () => {
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
        period={period}
      />,
    );
    expect(
      container.querySelector("[data-points]")?.getAttribute("data-points"),
    ).toBe("3");
    expect(container.querySelector("[data-chart]")).not.toBeNull();
    expect(container.textContent).toContain("Aug 26: $1.30");
    expect(container.textContent).toContain("Aug 25: $0.00");
    expect(container.textContent).not.toMatch(/1300000/);
  });

  it("renders nothing without a series", () => {
    const { container } = render(
      <UsageChart
        series={[]}
        bucket="day"
        period={{
          from: "2026-08-25T00:00:00.000Z",
          to: "2026-08-25T00:00:00.000Z",
        }}
      />,
    );
    expect(container.firstChild).toBeNull();
  });
});
