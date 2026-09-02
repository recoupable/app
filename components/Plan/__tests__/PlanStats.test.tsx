// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PlanStats from "@/components/Plan/PlanStats";

describe("PlanStats", () => {
  it("shows the plan, the refill date, the credits meter and the tasks meter", () => {
    render(
      <PlanStats
        currentPlan="free"
        refillDate="1 Sep"
        credits={{ remaining: 200_000, total: 3_330_000 }}
        tasks={{ enabled: 1, limit: 1 }}
      />,
    );
    expect(screen.getByText("Free")).toBeDefined();
    expect(screen.getByText("Refills 1 Sep")).toBeDefined();
    expect(screen.getByText("$0.20")).toBeDefined();
    expect(screen.getByText("of $3.33")).toBeDefined();
    expect(screen.getByText("of 1")).toBeDefined();
    const meters = screen.getAllByRole("progressbar");
    expect(meters.map((m) => m.getAttribute("aria-valuenow"))).toEqual(["6", "100"]);
  });

  it("shows the task count alone when the plan is uncapped", () => {
    render(
      <PlanStats currentPlan="pro" refillDate="" credits={{ remaining: 1, total: 1 }} tasks={{ enabled: 7, limit: null }} />,
    );
    expect(screen.getByText("7")).toBeDefined();
    expect(screen.queryByText(/of null|of undefined/)).toBeNull();
    expect(screen.getAllByRole("progressbar")).toHaveLength(1);
  });
});
