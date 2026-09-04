// @vitest-environment jsdom
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import usePayments from "@/hooks/usePayments";
import getAccountPayments from "@/lib/recoup/getAccountPayments";

vi.mock("@/lib/recoup/getAccountPayments", () => ({ default: vi.fn() }));
vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({ authenticated: true, getAccessToken: async () => "tok" }),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
);

describe("usePayments", () => {
  beforeEach(() => vi.clearAllMocks());

  it("fetches the first page and pages with the last id", async () => {
    vi.mocked(getAccountPayments)
      .mockResolvedValueOnce({ account_id: "acct-1", payments: [{ id: "in_1", createdAt: "2026-09-04T00:00:00Z", description: "Pro", amountCents: 9900, currency: "usd", status: "paid", url: null }], hasMore: true })
      .mockResolvedValueOnce({ account_id: "acct-1", payments: [], hasMore: false });
    const { result } = renderHook(() => usePayments("acct-1"), { wrapper });
    await waitFor(() => expect(result.current.data?.pages).toHaveLength(1));
    expect(getAccountPayments).toHaveBeenCalledWith("acct-1", "tok", { limit: 20, startingAfter: undefined });
    await result.current.fetchNextPage();
    await waitFor(() => expect(result.current.data?.pages).toHaveLength(2));
    expect(getAccountPayments).toHaveBeenLastCalledWith("acct-1", "tok", { limit: 20, startingAfter: "in_1" });
  });
});
