// @vitest-environment jsdom
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useCreateTask } from "@/hooks/useCreateTask";

const push = vi.fn();
const toastSuccess = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: vi.fn(),
  },
}));
vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({ getAccessToken: async () => "token" }),
}));
vi.mock("@/providers/ArtistProvider", () => ({
  useArtistProvider: () => ({ selectedArtist: { account_id: "artist-1" } }),
}));
vi.mock("@/lib/tasks/createTask", () => ({
  createTask: async () => ({ id: "task-new" }),
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
