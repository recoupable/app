// @vitest-environment jsdom
import React from "react";
import { act, renderHook, waitFor, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useArtistProfilePreferences } from "../useArtistProfilePreferences";
const auth = vi.hoisted(() => ({
  user: { id: "privy-account-one" },
  authenticated: true,
  getAccessToken: vi.fn().mockResolvedValue("test-token"),
}));
vi.mock("@privy-io/react-auth", () => ({ usePrivy: () => auth }));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));
const accountId = "11111111-1111-4111-8111-111111111111";
const artistId = "22222222-2222-4222-8222-222222222222";
let saved: string[] = [];
let failWrite = false;
let readAccounts: string[] = [];
const mount = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return renderHook(() => useArtistProfilePreferences(), {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });
};
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
beforeEach(() => {
  saved = [];
  failWrite = false;
  readAccounts = [];
  auth.user = { id: "privy-account-one" };
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, init: RequestInit) => {
      if (init.method === "PATCH") {
        if (failWrite) return Response.json({}, { status: 503 });
        const body = JSON.parse(init.body as string);
        saved = body.noProfile ? [body.artistId] : [];
      } else readAccounts.push(auth.user.id);
      return Response.json({ accountId, artistIds: saved });
    }),
  );
});
describe("saved profile choices", () => {
  it("loads the saved choice on a fresh mount and persists undo", async () => {
    const first = mount();
    await waitFor(() => expect(first.result.current.isSuccess).toBe(true));
    await act(async () => {
      await first.result.current.setNoProfile(artistId, true);
    });
    await waitFor(() =>
      expect(first.result.current.artistIds).toEqual([artistId]),
    );
    first.unmount();
    const fresh = mount();
    await waitFor(() =>
      expect(fresh.result.current.artistIds).toEqual([artistId]),
    );
    await act(async () => {
      await fresh.result.current.setNoProfile(artistId, false);
    });
    await waitFor(() => expect(fresh.result.current.artistIds).toEqual([]));
    expect(saved).toEqual([]);
  });
  it("leaves completion unchanged after a failed save", async () => {
    const view = mount();
    await waitFor(() => expect(view.result.current.isSuccess).toBe(true));
    failWrite = true;
    await act(async () => {
      await expect(
        view.result.current.setNoProfile(artistId, true),
      ).rejects.toThrow();
    });
    expect(view.result.current.artistIds).toEqual([]);
  });
  it("loads a separate cache when the signed-in identity changes", async () => {
    const view = mount();
    await waitFor(() => expect(view.result.current.isSuccess).toBe(true));
    auth.user = { id: "privy-account-two" };
    view.rerender();
    await waitFor(() => expect(readAccounts).toContain("privy-account-two"));
  });
});
