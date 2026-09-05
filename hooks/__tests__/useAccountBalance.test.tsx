// @vitest-environment jsdom
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import useAccountBalance from "@/hooks/useAccountBalance";
import getAccountCredits from "@/lib/recoup/getAccountCredits";

vi.mock("@/lib/recoup/getAccountCredits", () => ({ default: vi.fn() }));
vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({ authenticated: true, getAccessToken: async () => "tok" }),
}));

const client = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
);

describe("useAccountBalance", () => {
  it("fetches the balance for the given account id", async () => {
    vi.mocked(getAccountCredits).mockResolvedValueOnce({
      remaining_credits: 12400000,
    } as never);
    const { result } = renderHook(() => useAccountBalance("org-1"), {
      wrapper,
    });
    await waitFor(() => expect(result.current.data).toBe(12400000));
    expect(getAccountCredits).toHaveBeenCalledWith("org-1", "tok");
  });
});
