// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PlanLimitUpgradeModal from "@/components/UpgradePrompt/PlanLimitUpgradeModal";
import { useUpgradePromptProvider } from "@/hooks/useUpgradePromptProvider";
import { trackEvent } from "@/lib/analytics/trackEvent";

vi.mock("@/lib/analytics/trackEvent", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/useUpgradePromptProvider", () => ({ useUpgradePromptProvider: vi.fn() }));
const upgrade = vi.fn();
vi.mock("@/hooks/useUpgradeNavigation", () => ({ useUpgradeNavigation: () => ({ upgrade }) }));

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

  it("opens a dialog led by the number, with one Upgrade button, and tracks it", () => {
    vi.mocked(useUpgradePromptProvider).mockReturnValue({ planLimit: body, closePlanLimit: close } as never);
    render(<PlanLimitUpgradeModal />);
    const dialog = screen.getByRole("dialog");
    expect(dialog.getAttribute("aria-describedby")).not.toBeNull();
    expect(screen.getByText("1 of 1 tasks")).toBeDefined();
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("100");
    expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual(["Upgrade", "Keep Free", "Close"]);
    expect(trackEvent).toHaveBeenCalledWith("upgrade_prompt_shown", { trigger: "task_count" });
  });

  it("Upgrade closes the dialog and navigates with the trigger", () => {
    vi.mocked(useUpgradePromptProvider).mockReturnValue({ planLimit: body, closePlanLimit: close } as never);
    render(<PlanLimitUpgradeModal />);
    fireEvent.click(screen.getByRole("button", { name: "Upgrade" }));
    expect(upgrade).toHaveBeenCalledWith("task_count");
    expect(close).toHaveBeenCalledTimes(1);
  });

  it("Keep Free closes the dialog", () => {
    vi.mocked(useUpgradePromptProvider).mockReturnValue({ planLimit: body, closePlanLimit: close } as never);
    render(<PlanLimitUpgradeModal />);
    fireEvent.click(screen.getByRole("button", { name: "Keep Free" }));
    expect(close).toHaveBeenCalledTimes(1);
  });
});
