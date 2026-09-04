// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PlanPanel from "@/components/BillingPage/PlanPanel";

const base = { isPro: false, status: "none", plan: null, source: null, name: null, amountCents: null, currency: null, interval: null, collectionMethod: null, currentPeriodEnd: null } as const;

describe("PlanPanel", () => {
  it("renders Free with an Upgrade button when there is no subscription", () => {
    const onUpgrade = vi.fn();
    render(<PlanPanel subscription={{ ...base }} onUpgrade={onUpgrade} onManage={vi.fn()} />);
    expect(screen.getByText("Free")).toBeTruthy();
    expect(screen.getByText("$0.00 / month")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Upgrade" }));
    expect(onUpgrade).toHaveBeenCalled();
  });

  it("renders a card-billed plan with Manage billing", () => {
    const onManage = vi.fn();
    render(<PlanPanel subscription={{ ...base, isPro: true, status: "active", plan: "pro", source: "account", name: "Pro", amountCents: 9900, currency: "usd", interval: "month", collectionMethod: "charge_automatically", currentPeriodEnd: "2026-10-04T00:00:00Z" }} onUpgrade={vi.fn()} onManage={onManage} />);
    expect(screen.getByText("Pro")).toBeTruthy();
    expect(screen.getByText("$99.00 / month")).toBeTruthy();
    expect(screen.getByText(/Renews Oct 4, 2026 on the card above/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Manage billing" }));
    expect(onManage).toHaveBeenCalled();
  });

  it("renders an invoiced plan with no button", () => {
    render(<PlanPanel subscription={{ ...base, isPro: true, status: "active", plan: "pro", source: "organization", name: null, amountCents: 500000, currency: "usd", interval: "month", collectionMethod: "send_invoice", currentPeriodEnd: "2026-09-17T00:00:00Z" }} onUpgrade={vi.fn()} onManage={vi.fn()} />);
    expect(screen.getByText("Enterprise")).toBeTruthy();
    expect(screen.getByText("$5,000.00 / month, invoiced")).toBeTruthy();
    expect(screen.getByText(/Next invoice Sep 17, 2026/)).toBeTruthy();
    expect(screen.getByText(/Plan changes go through your Recoup contact/)).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
  });
});
