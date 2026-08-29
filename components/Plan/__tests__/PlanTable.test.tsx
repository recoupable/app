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

  it("inverts the current plan column, not always Pro", () => {
    const { rerender } = render(
      <PlanTable currentPlan="free" starterAvailable={false} onStartCheckout={startCheckout} />,
    );
    const freeHeader = screen.getByRole("columnheader", { name: /Free/ });
    const proHeader = screen.getByRole("columnheader", { name: /Pro/ });
    expect(freeHeader.className).toContain("bg-foreground");
    expect(proHeader.className).not.toContain("bg-foreground");

    rerender(<PlanTable currentPlan="pro" starterAvailable={false} onStartCheckout={startCheckout} />);
    expect(screen.getByRole("columnheader", { name: /Free/ }).className).not.toContain("bg-foreground");
    expect(screen.getByRole("columnheader", { name: /Pro/ }).className).toContain("bg-foreground");
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
