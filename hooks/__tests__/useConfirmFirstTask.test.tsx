// @vitest-environment jsdom
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useConfirmFirstTask } from "@/hooks/useConfirmFirstTask";

const updateTask = vi.fn(async () => ({}));
const deleteTask = vi.fn(async () => undefined);

vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({ getAccessToken: async () => "token" }),
}));
vi.mock("@/hooks/useWeeklyReportTaskInput", () => ({
  useWeeklyReportTaskInput: () => ({
    resolve: () => ({
      artistName: "Luh Tyler",
      artistAccountId: "artist-1",
      recipientEmail: "owner@example.com",
    }),
  }),
}));
vi.mock("@/lib/onboarding/createWeeklyReportTask", () => ({
  createWeeklyReportTask: vi.fn(async () => ({
    id: "task-new",
    enabled: true,
  })),
}));
vi.mock("@/lib/tasks/updateTask", () => ({
  updateTask: (...args: unknown[]) => updateTask(...(args as [])),
}));
vi.mock("@/lib/tasks/deleteTask", () => ({
  deleteTask: (...args: unknown[]) => deleteTask(...(args as [])),
}));

// "Turn off" pauses rather than deletes (recoupable/app#1941 review): a
// deleted task re-opens the onboarding gate, which would create it again.
describe("useConfirmFirstTask turn off", () => {
  it("pauses the created task and reports it turned off", async () => {
    const client = new QueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useConfirmFirstTask({}), { wrapper });

    act(() => result.current.confirm());
    await waitFor(() => expect(result.current.phase).toBe("scheduled"));

    act(() => result.current.turnOff());
    await waitFor(() => expect(result.current.phase).toBe("declined"));
    expect(updateTask).toHaveBeenCalledWith("token", {
      id: "task-new",
      enabled: false,
    });
    expect(deleteTask).not.toHaveBeenCalled();
  });
});
