// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PlanPanel from "@/components/BillingPage/PlanPanel";

const free = {
  isPro: false,
  status: "none",
  plan: null,
  source: null,
  name: null,
  amountCents: null,
  currency: null,
  interval: null,
  collectionMethod: null,
  currentPeriodEnd: null,
} as const;

describe("PlanPanel for an organization", () => {
  it("renders Free without Upgrade and points to the Recoup contact", () => {
    render(
      <PlanPanel
        subscription={{ ...free }}
        onUpgrade={vi.fn()}
        onManage={vi.fn()}
        canUpgrade={false}
      />,
    );
    expect(screen.getByText("Free")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Upgrade" })).toBeNull();
    expect(screen.getByText(/Recoup contact/)).toBeTruthy();
  });
});
