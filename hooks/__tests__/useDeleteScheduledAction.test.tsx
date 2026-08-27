// @vitest-environment jsdom
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useDeleteScheduledAction } from "@/hooks/useDeleteScheduledAction";
import { deleteTask } from "@/lib/tasks/deleteTask";

const toastError = vi.fn();
vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: (...args: unknown[]) => toastError(...args),
  },
}));
vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({ getAccessToken: async () => "token" }),
}));
vi.mock("@/lib/tasks/deleteTask", () => ({ deleteTask: vi.fn() }));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);

describe("useDeleteScheduledAction (app#2016 item 2)", () => {
  it("shows the API's own error in the toast instead of the generic message", async () => {
    vi.mocked(deleteTask).mockRejectedValue(
      new Error(
        'HTTP 403: {"status":"error","error":"Access denied to this task"}',
      ),
    );
    const { result } = renderHook(() => useDeleteScheduledAction(), {
      wrapper,
    });
    await act(async () => {
      await result.current
        .deleteAction({ actionId: "task-a" })
        .catch(() => undefined);
    });
    await waitFor(() => expect(toastError).toHaveBeenCalledTimes(1));
    expect(toastError.mock.calls[0][0]).toBe("Access denied to this task");
  });
});
