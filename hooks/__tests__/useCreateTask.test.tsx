// @vitest-environment jsdom
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useCreateTask } from "@/hooks/useCreateTask";

const push = vi.fn();
const toastSuccess = vi.fn();
const toastError = vi.fn();
const showPlanLimit = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}));
vi.mock("@/providers/UpgradePromptProvider", () => ({
  useUpgradePromptProvider: () => ({ showPlanLimit }),
}));
vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({ getAccessToken: async () => "token" }),
}));
vi.mock("@/providers/ArtistProvider", () => ({
  useArtistProvider: () => ({ selectedArtist: { account_id: "artist-1" } }),
}));
vi.mock("@/lib/tasks/createTask", () => ({
  createTask: vi.fn(async () => ({ id: "task-new" })),
}));

describe("useCreateTask", () => {
  it("the success toast's View action opens the new task's page", async () => {
    const client = new QueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useCreateTask(), { wrapper });

    act(() => result.current.handleCreateTask());
    await waitFor(() => expect(toastSuccess).toHaveBeenCalledTimes(1));

    toastSuccess.mock.calls[0][1].action.onClick();
    expect(push).toHaveBeenCalledWith("/tasks/task-new");
  });
});

describe("useCreateTask on a plan limit", () => {
  it("opens the upgrade modal instead of the generic failure toast", async () => {
    const { PlanLimitError } = await import("@/lib/tasks/planLimitError");
    const { createTask } = await import("@/lib/tasks/createTask");
    const body = {
      status: "error" as const,
      error: "plan_limit" as const,
      limit: "task_count" as const,
      message: "m",
      plan: "free" as const,
      task_limit: 1,
      min_cadence_minutes: 10080,
      current_task_count: 1,
      billingUrl: "https://app.recoupable.dev",
    };
    vi.mocked(createTask).mockRejectedValueOnce(new PlanLimitError(body));
    vi.spyOn(console, "error").mockImplementation(() => {});

    const client = new QueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useCreateTask(), { wrapper });
    act(() => result.current.handleCreateTask());
    await waitFor(() => expect(showPlanLimit).toHaveBeenCalledWith(body));
    expect(toastError).not.toHaveBeenCalled();
  });
});
