// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CreditsUpgradePrompt from "@/components/UpgradePrompt/CreditsUpgradePrompt";
import useCredits from "@/hooks/useCredits";

vi.mock("@/hooks/useCredits", () => ({ default: vi.fn() }));
vi.mock("@/lib/analytics/trackEvent", () => ({ trackEvent: vi.fn() }));
const upgrade = vi.fn();
vi.mock("@/hooks/useUpgradeNavigation", () => ({ useUpgradeNavigation: () => ({ upgrade }) }));

const credits = (remaining: number, extra: Record<string, unknown> = {}) => ({
  data: {
    account_id: "a",
    remaining_credits: remaining,
    total_credits: 3_330_000,
    used_credits: 3_330_000 - remaining,
    is_pro: false,
    timestamp: "2026-08-29T00:00:00Z",
    ...extra,
  },
});

describe("CreditsUpgradePrompt", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
  });

  it("renders nothing while the balance is healthy or still loading", () => {
    vi.mocked(useCredits).mockReturnValue(credits(3_000_000) as never);
    expect(render(<CreditsUpgradePrompt />).container.innerHTML).toBe("");
    vi.mocked(useCredits).mockReturnValue({ data: undefined } as never);
    expect(render(<CreditsUpgradePrompt />).container.innerHTML).toBe("");
  });

  it("renders nothing for a Pro account, whatever the balance", () => {
    vi.mocked(useCredits).mockReturnValue(credits(0, { is_pro: true }) as never);
    expect(render(<CreditsUpgradePrompt />).container.innerHTML).toBe("");
  });

  it("shows the balance as the headline when it is low", () => {
    vi.mocked(useCredits).mockReturnValue(credits(200_000) as never);
    render(<CreditsUpgradePrompt />);
    expect(screen.getByText("$0.20 left")).toBeDefined();
    expect(screen.getByText("of $3.33 this month")).toBeDefined();
  });

  it("shows $0.00 left when the balance is gone", () => {
    vi.mocked(useCredits).mockReturnValue(credits(0) as never);
    render(<CreditsUpgradePrompt />);
    expect(screen.getByText("$0.00 left")).toBeDefined();
    expect(screen.getByText(/used this month's credits/)).toBeDefined();
  });

  it("Upgrade navigates with the trigger; Keep Free hides the card", () => {
    vi.mocked(useCredits).mockReturnValue(credits(200_000) as never);
    const { container } = render(<CreditsUpgradePrompt />);
    fireEvent.click(screen.getByRole("button", { name: "Upgrade" }));
    expect(upgrade).toHaveBeenCalledWith("credits_low");
    fireEvent.click(screen.getByRole("button", { name: "Keep Free" }));
    expect(container.innerHTML).toBe("");
  });
});
