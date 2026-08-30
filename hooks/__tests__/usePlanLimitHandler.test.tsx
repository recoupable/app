// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePlanLimitHandler } from "@/hooks/usePlanLimitHandler";
import { PlanLimitError } from "@/lib/tasks/planLimitError";

const toastError = vi.fn();
const showPlanLimit = vi.fn();
vi.mock("sonner", () => ({ toast: { error: (...args: unknown[]) => toastError(...args) } }));
vi.mock("@/hooks/useUpgradePromptProvider", () => ({
  useUpgradePromptProvider: () => ({ showPlanLimit }),
}));

const body = {
  status: "error" as const,
  error: "plan_limit" as const,
  limit: "min_cadence" as const,
  message: "Pro runs hourly at the fastest.",
  plan: "free" as const,
  task_limit: 1,
  min_cadence_minutes: 10080,
  current_task_count: 0,
  billingUrl: "https://app.recoupable.dev",
};

describe("usePlanLimitHandler", () => {
  beforeEach(() => vi.clearAllMocks());

  it("opens the modal when a plan above the current one exists", () => {
    const { result } = renderHook(() => usePlanLimitHandler());
    result.current.handlePlanLimit(new PlanLimitError(body));
    expect(showPlanLimit).toHaveBeenCalledWith(body);
    expect(toastError).not.toHaveBeenCalled();
  });

  it("shows the api's message to a Pro account, which has nothing to upgrade to", () => {
    const { result } = renderHook(() => usePlanLimitHandler());
    result.current.handlePlanLimit(new PlanLimitError({ ...body, plan: "pro", task_limit: null, min_cadence_minutes: 60 }));
    expect(showPlanLimit).not.toHaveBeenCalled();
    expect(toastError).toHaveBeenCalledWith("Pro runs hourly at the fastest.");
  });
});
