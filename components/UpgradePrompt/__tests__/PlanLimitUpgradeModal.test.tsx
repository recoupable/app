// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PlanLimitUpgradeModal from "@/components/UpgradePrompt/PlanLimitUpgradeModal";
import { useUpgradePromptProvider } from "@/hooks/useUpgradePromptProvider";
import { trackEvent } from "@/lib/analytics/trackEvent";

vi.mock("@/lib/analytics/trackEvent", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/useUpgradePromptProvider", () => ({ useUpgradePromptProvider: vi.fn() }));
const startCheckout = vi.fn();
vi.mock("@/hooks/useUpgradeCheckout", () => ({ useUpgradeCheckout: () => ({ startCheckout }) }));

const body = {
  status: "error" as const,
  error: "plan_limit" as const,
  limit: "task_count" as const,
  message: "Free includes 1 task.",
  plan: "free" as const,
  task_limit: 1,
  min_cadence_minutes: 10080,
  current_task_count: 1,
  billingUrl: "https://app.recoupable.dev",
};

describe("PlanLimitUpgradeModal", () => {
  const close = vi.fn();
  beforeEach(() => vi.clearAllMocks());

  it("renders nothing while no plan limit was hit", () => {
    vi.mocked(useUpgradePromptProvider).mockReturnValue({ planLimit: null, closePlanLimit: close } as never);
    render(<PlanLimitUpgradeModal />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens a dialog naming the trigger with both plans, and tracks it", () => {
    vi.mocked(useUpgradePromptProvider).mockReturnValue({ planLimit: body, closePlanLimit: close } as never);
    render(<PlanLimitUpgradeModal />);
    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByText(/1 task/)).toBeDefined();
    expect(screen.getByRole("dialog").getAttribute("aria-describedby")).not.toBeNull();
    expect(screen.getByRole("button", { name: /Start Starter/ })).toBeDefined();
    expect(trackEvent).toHaveBeenCalledWith("upgrade_prompt_shown", { trigger: "task_count", plan_offered: "starter,pro" });
  });

  it("choosing a plan starts checkout for it", () => {
    vi.mocked(useUpgradePromptProvider).mockReturnValue({ planLimit: body, closePlanLimit: close } as never);
    render(<PlanLimitUpgradeModal />);
    fireEvent.click(screen.getByRole("button", { name: /Start 30-day trial/ }));
    expect(startCheckout).toHaveBeenCalledWith("pro");
  });

  it("Keep Free closes the dialog", () => {
    vi.mocked(useUpgradePromptProvider).mockReturnValue({ planLimit: body, closePlanLimit: close } as never);
    render(<PlanLimitUpgradeModal />);
    fireEvent.click(screen.getByRole("button", { name: "Keep Free" }));
    expect(close).toHaveBeenCalledTimes(1);
  });
});
