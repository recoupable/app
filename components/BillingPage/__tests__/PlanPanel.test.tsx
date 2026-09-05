// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PlanPanel from "@/components/BillingPage/PlanPanel";

const base = {
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

describe("PlanPanel", () => {
  it("renders Free with an Upgrade button when there is no subscription", () => {
    const onUpgrade = vi.fn();
    render(
      <PlanPanel
        subscription={{ ...base }}
        onUpgrade={onUpgrade}
        onManage={vi.fn()}
      />,
    );
    expect(screen.getByText("Free")).toBeTruthy();
    expect(screen.getByText("$0.00 / month")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Upgrade" }));
    expect(onUpgrade).toHaveBeenCalled();
  });

  it("renders a card-billed plan with Manage billing", () => {
    const onManage = vi.fn();
    render(
      <PlanPanel
        subscription={{
          ...base,
          isPro: true,
          status: "active",
          plan: "pro",
          source: "account",
          name: "Pro",
          amountCents: 9900,
          currency: "usd",
          interval: "month",
          collectionMethod: "charge_automatically",
          currentPeriodEnd: "2026-10-04T00:00:00Z",
        }}
        onUpgrade={vi.fn()}
        onManage={onManage}
      />,
    );
    expect(screen.getByText("Pro")).toBeTruthy();
    expect(screen.getByText("$99.00 / month")).toBeTruthy();
    expect(
      screen.getByText(/Renews Oct 4, 2026 on the card above/),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Manage billing" }));
    expect(onManage).toHaveBeenCalled();
  });

  it("renders an invoiced plan with no button", () => {
    render(
      <PlanPanel
        subscription={{
          ...base,
          isPro: true,
          status: "active",
          plan: "pro",
          source: "organization",
          name: null,
          amountCents: 500000,
          currency: "usd",
          interval: "month",
          collectionMethod: "send_invoice",
          currentPeriodEnd: "2026-09-17T00:00:00Z",
        }}
        onUpgrade={vi.fn()}
        onManage={vi.fn()}
      />,
    );
    expect(screen.getByText("Enterprise")).toBeTruthy();
    expect(screen.getByText("$5,000.00 / month, invoiced")).toBeTruthy();
    expect(screen.getByText(/Next invoice Sep 17, 2026/)).toBeTruthy();
    expect(
      screen.getByText(/Plan changes go through your Recoup contact/),
    ).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
  });

  const paid = {
    ...base,
    isPro: true,
    plan: "pro",
    source: "account",
    name: "Pro",
    amountCents: 9900,
    currency: "usd",
    interval: "month",
    collectionMethod: "charge_automatically",
    currentPeriodEnd: "2026-10-04T00:00:00Z",
  } as const;

  it("shows a Trial badge and the renewal line while trialing", () => {
    render(
      <PlanPanel
        subscription={{ ...paid, status: "trialing" }}
        onUpgrade={vi.fn()}
        onManage={vi.fn()}
      />,
    );
    expect(screen.getByText("Trial")).toBeTruthy();
    expect(screen.getByText(/Renews Oct 4, 2026/)).toBeTruthy();
  });

  it("says the plan ends, not renews, when canceled", () => {
    render(
      <PlanPanel
        subscription={{ ...paid, status: "canceled" }}
        onUpgrade={vi.fn()}
        onManage={vi.fn()}
      />,
    );
    expect(screen.getByText("Canceled")).toBeTruthy();
    expect(screen.getByText(/Ends Oct 4, 2026/)).toBeTruthy();
    expect(screen.queryByText(/Renews/)).toBeNull();
  });

  it("asks for a card update when past due", () => {
    render(
      <PlanPanel
        subscription={{ ...paid, status: "past_due" }}
        onUpgrade={vi.fn()}
        onManage={vi.fn()}
      />,
    );
    expect(screen.getByText("Past due")).toBeTruthy();
    expect(screen.getByText(/Payment failed, update your card/)).toBeTruthy();
  });

  it("never renders a missing price as zero", () => {
    render(
      <PlanPanel
        subscription={{ ...paid, status: "active", amountCents: null }}
        onUpgrade={vi.fn()}
        onManage={vi.fn()}
      />,
    );
    expect(screen.getByText(/Price unavailable/)).toBeTruthy();
    expect(screen.queryByText(/\$0\.00/)).toBeNull();
  });

  it("capitalizes the plan id when the name is missing", () => {
    render(
      <PlanPanel
        subscription={{
          ...paid,
          status: "active",
          name: null,
          plan: "starter",
        }}
        onUpgrade={vi.fn()}
        onManage={vi.fn()}
      />,
    );
    expect(screen.getByText("Starter")).toBeTruthy();
  });
});
