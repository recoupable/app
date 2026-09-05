// @vitest-environment jsdom
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import useAutoTopUp from "@/hooks/useAutoTopUp";
import getAccountAutoTopUp from "@/lib/recoup/getAccountAutoTopUp";

vi.mock("@/lib/recoup/getAccountAutoTopUp", () => ({ default: vi.fn() }));
vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({ authenticated: true, getAccessToken: async () => "tok" }),
}));

const makeWrapper = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return Wrapper;
};

describe("useAutoTopUp", () => {
  beforeEach(() => vi.clearAllMocks());

  it("fetches the settings for the given account", async () => {
    const settings = {
      account_id: "acct-1",
      enabled: false,
      amountCents: null,
      thresholdCents: null,
      lastRunAt: null,
      lastError: null,
    };
    vi.mocked(getAccountAutoTopUp).mockResolvedValue(settings);
    const { result } = renderHook(() => useAutoTopUp("acct-1"), {
      wrapper: makeWrapper(),
    });
    await waitFor(() => expect(result.current.data).toEqual(settings));
    expect(getAccountAutoTopUp).toHaveBeenCalledWith("acct-1", "tok");
  });

  it("does not fetch without an account id", () => {
    renderHook(() => useAutoTopUp(undefined), { wrapper: makeWrapper() });
    expect(getAccountAutoTopUp).not.toHaveBeenCalled();
  });
});
