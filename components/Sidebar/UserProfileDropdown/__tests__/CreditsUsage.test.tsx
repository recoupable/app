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
    // A raw count is only readable while a credit is worth a cent. At a
    // micro-dollar the same balance reads "3,330,000" (chat#2000).
    mock({ totalCredits: 333, credits: 333, isLoading: false });

    render(<CreditsUsage />);

    expect(screen.getByText("$3.33 / $3.33")).toBeDefined();
    expect(screen.queryByText(/333 \/ 333/)).toBeNull();
  });

  it("shows a partially spent balance", () => {
    mock({ totalCredits: 333, credits: 120, isLoading: false });

    render(<CreditsUsage />);

    expect(screen.getByText("$1.20 / $3.33")).toBeDefined();
  });

  it("shows a placeholder while loading", () => {
    mock({ totalCredits: 0, credits: 0, isLoading: true });

    const { container } = render(<CreditsUsage />);

    expect(container.querySelector(".animate-pulse")).not.toBeNull();
  });
});
