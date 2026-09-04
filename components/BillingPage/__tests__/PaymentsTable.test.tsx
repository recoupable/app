// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PaymentsTable from "@/components/BillingPage/PaymentsTable";

const payment = { id: "in_1", createdAt: "2026-09-04T14:33:00Z", description: "Pro, monthly", amountCents: 9900, currency: "usd", status: "paid" as const, url: "https://invoice.stripe.com/i/1" };

describe("PaymentsTable", () => {
  it("renders a row per payment with a receipt link", () => {
    render(<PaymentsTable payments={[payment]} />);
    expect(screen.getByText("Sep 4, 2026")).toBeTruthy();
    expect(screen.getByText("Pro, monthly")).toBeTruthy();
    expect(screen.getByText("$99.00")).toBeTruthy();
    expect(screen.getAllByText("Paid").length).toBeGreaterThan(0);
    expect((screen.getByRole("link", { name: /Receipt/ }) as HTMLAnchorElement).href).toBe("https://invoice.stripe.com/i/1");
  });

  it("renders the empty state", () => {
    render(<PaymentsTable payments={[]} />);
    expect(screen.getByText("No payments yet.")).toBeTruthy();
  });
});
