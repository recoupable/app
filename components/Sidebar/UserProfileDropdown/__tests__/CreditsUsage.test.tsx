// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import CreditsUsage from "@/components/Sidebar/UserProfileDropdown/CreditsUsage";
import { usePaymentProvider } from "@/providers/PaymentProvider";

vi.mock("@/providers/PaymentProvider", () => ({ usePaymentProvider: vi.fn() }));

const mock = (v: Record<string, unknown>) => vi.mocked(usePaymentProvider).mockReturnValue(v as never);

describe("CreditsUsage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows the balance as currency, not a raw credit count", () => {
    // The API returns micro-dollars; shown raw the free allotment reads
    // "3330000", which tells a customer nothing (recoupable/app#2000).
    mock({ totalCredits: 3_330_000, credits: 3_330_000, isLoading: false });

    render(<CreditsUsage />);

    expect(screen.getByText("$3.33 / $3.33")).toBeDefined();
    expect(screen.queryByText(/3330000/)).toBeNull();
  });

  it("shows a partially spent balance", () => {
    mock({ totalCredits: 3_330_000, credits: 1_200_000, isLoading: false });

    render(<CreditsUsage />);

    expect(screen.getByText("$1.20 / $3.33")).toBeDefined();
  });

  it("shows a placeholder while loading", () => {
    mock({ totalCredits: 0, credits: 0, isLoading: true });

    const { container } = render(<CreditsUsage />);

    expect(container.querySelector(".animate-pulse")).not.toBeNull();
  });
});
