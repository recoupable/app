// @vitest-environment jsdom
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import useAccountUsage from "@/hooks/useAccountUsage";
import getAccountUsage from "@/lib/recoup/getAccountUsage";

vi.mock("@/lib/recoup/getAccountUsage", () => ({ default: vi.fn() }));
vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({ authenticated: true, getAccessToken: async () => "tok" }),
}));
vi.mock("@/providers/UserProvder", () => ({
  useUserProvider: () => ({ userData: { account_id: "acct-1" } }),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider
    client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
  >
    {children}
  </QueryClientProvider>
);
const page = (next_cursor: string | null) => ({
  account_id: "acct-1",
  period: { from: "a", to: "b" },
  total_credits_deducted: 0,
  total_usd: "$0.00",
  events: [],
  next_cursor,
});

describe("useAccountUsage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("fetches the signed-in account's usage and pages with next_cursor", async () => {
    vi.mocked(getAccountUsage)
      .mockResolvedValueOnce(page("cur-1"))
      .mockResolvedValueOnce(page(null));

    const { result } = renderHook(() => useAccountUsage({ range: "7d" }), {
      wrapper,
    });
    await waitFor(() => expect(result.current.data?.pages).toHaveLength(1));

    expect(getAccountUsage).toHaveBeenCalledWith(
      "acct-1",
      "tok",
      expect.objectContaining({
        limit: 20,
        cursor: undefined,
        from: expect.any(String),
        to: expect.any(String),
      }),
    );
    expect(result.current.hasNextPage).toBe(true);

    await result.current.fetchNextPage();
    await waitFor(() => expect(result.current.data?.pages).toHaveLength(2));

    expect(getAccountUsage).toHaveBeenLastCalledWith(
      "acct-1",
      "tok",
      expect.objectContaining({ limit: 20, cursor: "cur-1" }),
    );
    expect(result.current.hasNextPage).toBe(false);
  });
});
