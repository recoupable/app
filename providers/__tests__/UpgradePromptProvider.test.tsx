// @vitest-environment jsdom
import React from "react";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UpgradePromptProvider, useUpgradePromptProvider } from "@/providers/UpgradePromptProvider";

const body = {
  status: "error" as const,
  error: "plan_limit" as const,
  limit: "min_cadence" as const,
  message: "m",
  plan: "free" as const,
  task_limit: 1,
  min_cadence_minutes: 10080,
  current_task_count: 0,
  billingUrl: "https://app.recoupable.dev",
};

describe("UpgradePromptProvider", () => {
  it("holds the last plan limit hit until it is closed", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <UpgradePromptProvider>{children}</UpgradePromptProvider>
    );
    const { result } = renderHook(() => useUpgradePromptProvider(), { wrapper });
    expect(result.current.planLimit).toBeNull();
    act(() => result.current.showPlanLimit(body));
    expect(result.current.planLimit).toEqual(body);
    act(() => result.current.closePlanLimit());
    expect(result.current.planLimit).toBeNull();
  });
});
