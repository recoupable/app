// @vitest-environment jsdom
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import useAccountQuery from "@/hooks/useAccountQuery";

vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({ authenticated: true, getAccessToken: async () => "tok" }),
}));

const wrap = (client: QueryClient) =>
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };

describe("useAccountQuery", () => {
  // Billing data changes on a scale of days; a tab switch must not reload it.
  it("keeps data fresh for hours and never refetches on window focus", async () => {
    const client = new QueryClient();
    const fetcher = vi.fn(async () => ({ ok: true }));
    const { result } = renderHook(
      () => useAccountQuery("thing", "acct-1", fetcher),
      {
        wrapper: wrap(client),
      },
    );
    await waitFor(() => expect(result.current.data).toEqual({ ok: true }));
    const options = client
      .getQueryCache()
      .find({ queryKey: ["thing", "acct-1"] })?.options as {
      staleTime?: number;
      gcTime?: number;
      refetchOnWindowFocus?: boolean;
    };
    expect(options.staleTime).toBeGreaterThanOrEqual(60 * 60 * 1000);
    expect(options.gcTime).toBeGreaterThanOrEqual(60 * 60 * 1000);
    expect(options.refetchOnWindowFocus).toBe(false);
  });

  it("does not retry a 4xx", async () => {
    const client = new QueryClient();
    const fetcher = vi.fn(async () => {
      throw Object.assign(new Error("Failed: 404"), { status: 404 });
    });
    const { result } = renderHook(
      () => useAccountQuery("thing", "acct-2", fetcher),
      {
        wrapper: wrap(client),
      },
    );
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
