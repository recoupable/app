// @vitest-environment jsdom
import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { useRefreshCatalogsOnLanding } from "@/hooks/useRefreshCatalogsOnLanding";

describe("useRefreshCatalogsOnLanding", () => {
  it("invalidates cached catalogs on mount so each landing re-derives fresh", async () => {
    const queryClient = new QueryClient();
    // Simulate a fresh-but-stale-in-reality cache entry from useCatalogs
    // (staleTime 5min): an out-of-band claim would otherwise be missed.
    queryClient.setQueryData(["catalogs", "acct-a"], { catalogs: [] });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    renderHook(() => useRefreshCatalogsOnLanding(), { wrapper });

    await waitFor(() => {
      expect(
        queryClient.getQueryState(["catalogs", "acct-a"])?.isInvalidated,
      ).toBe(true);
    });
  });

  it("leaves unrelated query caches untouched", async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(["artists", "user-1", null], []);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    renderHook(() => useRefreshCatalogsOnLanding(), { wrapper });

    expect(
      queryClient.getQueryState(["artists", "user-1", null])?.isInvalidated,
    ).toBe(false);
  });
});
