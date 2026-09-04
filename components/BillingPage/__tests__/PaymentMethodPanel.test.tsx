// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PaymentMethodPanel from "@/components/BillingPage/PaymentMethodPanel";

describe("PaymentMethodPanel", () => {
  it("shows the card with Replace and Remove", () => {
    const onRemove = vi.fn();
    render(<PaymentMethodPanel card={{ brand: "visa", last4: "4242", exp_month: 12, exp_year: 2027, funding: "credit" }} onConfigure={vi.fn()} onRemove={onRemove} isBusy={false} />);
    expect(screen.getByText("Visa ending in 4242")).toBeTruthy();
    expect(screen.getByText("Expires 12/2027")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Replace card" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Remove" }));
    expect(onRemove).toHaveBeenCalled();
  });

  it("shows the empty state with Configure billing", () => {
    const onConfigure = vi.fn();
    render(<PaymentMethodPanel card={null} onConfigure={onConfigure} onRemove={vi.fn()} isBusy={false} />);
    expect(screen.getByText(/No payment method on file/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Configure billing" }));
    expect(onConfigure).toHaveBeenCalled();
  });
});
