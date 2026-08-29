// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PlanTable from "@/components/Plan/PlanTable";

describe("PlanTable", () => {
  const startCheckout = vi.fn();
  beforeEach(() => vi.clearAllMocks());

  it("renders the three plan headers, the approved rows, and marks the current plan", () => {
    render(<PlanTable currentPlan="free" starterAvailable={false} onStartCheckout={startCheckout} />);
    expect(screen.getByText("$99/mo, 3x credits")).toBeDefined();
    expect(screen.getAllByText("API keys").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Current plan").length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: "Start Starter" })).toBeNull();
    fireEvent.click(screen.getAllByRole("button", { name: "Start 30-day trial" })[0]);
    expect(startCheckout).toHaveBeenCalledWith("pro");
  });

  it("offers Starter once the api sells it", () => {
    render(<PlanTable currentPlan="free" starterAvailable onStartCheckout={startCheckout} />);
    fireEvent.click(screen.getAllByRole("button", { name: "Start Starter" })[0]);
    expect(startCheckout).toHaveBeenCalledWith("starter");
  });

  it("shows no buy button for the plan the account is already on or below", () => {
    render(<PlanTable currentPlan="pro" starterAvailable onStartCheckout={startCheckout} />);
    expect(screen.queryByRole("button", { name: /Start/ })).toBeNull();
  });
});
