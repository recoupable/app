// @vitest-environment jsdom
import React from "react";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCatalogReportHeader } from "../useCatalogReportHeader";
import useCatalogReportSongs from "../useCatalogReportSongs";
const { scope, getCatalogs, getCatalogSongs } = vi.hoisted(() => ({
  scope: {
    account: "account-a",
    org: null as string | null,
    auth: true,
    initialized: true,
  },
  getCatalogs: vi.fn(),
  getCatalogSongs: vi.fn(),
}));
vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({
    ready: true,
    authenticated: scope.auth,
    user: { id: scope.account },
    getAccessToken: async () => "synthetic",
  }),
}));
vi.mock("@/providers/UserProvder", () => ({
  useUserProvider: () => ({ userData: { account_id: scope.account } }),
}));
vi.mock("@/providers/OrganizationProvider", () => ({
  useOrganization: () => ({
    selectedOrgId: scope.org,
    isInitialized: scope.initialized,
  }),
}));
vi.mock("@/lib/catalog/getCatalogs", () => ({ getCatalogs }));
vi.mock("@/lib/catalog/getCatalogSongs", () => ({ getCatalogSongs }));
const first = "11111111-1111-4111-8111-111111111111",
  second = "22222222-2222-4222-8222-222222222222";
const catalog = (id: string, owner = "account-a") => ({
  id,
  name: id === first ? "First" : "Second",
  owner: { id: owner },
});
function setup(id: string = second, withReport = false) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return renderHook(
    ({ id }) => {
      const header = useCatalogReportHeader(id);
      useCatalogReportSongs(id, withReport); // The mounted report shares this exact query.
      return header;
    },
    {
      initialProps: { id },
      wrapper,
    },
  );
}
beforeEach(() => {
  scope.account = "account-a";
  scope.org = null;
  scope.auth = true;
  scope.initialized = true;
  getCatalogs.mockReset();
  getCatalogSongs.mockReset();
  getCatalogSongs.mockResolvedValue({
    songs: [{ name: "One loaded song" }],
    pagination: { total_count: 245, page: 1, limit: 100, total_pages: 3 },
  });
  getCatalogs.mockResolvedValue({
    catalogs: [catalog(first), catalog(second)],
  });
});
afterEach(cleanup);
describe("catalog report header", () => {
  it("identifies the second catalog and uses total_count rather than loaded or measured songs", async () => {
    const h = setup();
    await waitFor(() => expect(h.result.current.totalSongs).toBe(245));
    expect(h.result.current.catalogName).toBe("Second");
    expect(getCatalogSongs).toHaveBeenCalledExactlyOnceWith(
      "synthetic",
      second,
      100,
      1,
    );
  });
  it("shares one bounded songs request with the report", async () => {
    const h = setup(second, true);
    await waitFor(() => expect(h.result.current.totalSongs).toBe(245));
    expect(getCatalogSongs).toHaveBeenCalledExactlyOnceWith(
      "synthetic",
      second,
      100,
      1,
    );
  });
  it.each([0, 1, 700])("preserves authoritative count %s", async (total) => {
    getCatalogSongs.mockResolvedValue({
      songs: [],
      pagination: { total_count: total },
    });
    const h = setup();
    await waitFor(() => expect(h.result.current.totalSongs).toBe(total));
  });
  it.each([undefined, -1, 1.5, "245", NaN])(
    "shows unknown for invalid count %s",
    async (total) => {
      getCatalogSongs.mockResolvedValue({
        songs: [],
        pagination: { total_count: total },
      });
      const h = setup();
      await waitFor(() => expect(getCatalogSongs).toHaveBeenCalledOnce());
      expect(h.result.current.totalSongs).toBeUndefined();
    },
  );
  it("keeps the authorized name when the songs read fails", async () => {
    getCatalogSongs.mockRejectedValue(new Error("unavailable"));
    const h = setup();
    await waitFor(() => expect(h.result.current.catalogName).toBe("Second"));
    expect(h.result.current.totalSongs).toBeUndefined();
  });
  it("does not expose foreign catalog identity or count", async () => {
    getCatalogs.mockResolvedValue({ catalogs: [catalog(first)] });
    const h = setup();
    await waitFor(() => expect(getCatalogs).toHaveBeenCalledOnce());
    expect(h.result.current).toEqual({
      catalogName: undefined,
      totalSongs: undefined,
    });
    expect(getCatalogSongs).not.toHaveBeenCalled();
  });
  it("does not expose stale name/count after account change and late response", async () => {
    let finish!: (value: unknown) => void;
    getCatalogSongs.mockImplementationOnce(
      () =>
        new Promise((r) => {
          finish = r;
        }),
    );
    const h = setup();
    await waitFor(() => expect(getCatalogSongs).toHaveBeenCalledOnce());
    scope.account = "account-b";
    getCatalogs.mockResolvedValue({ catalogs: [] });
    h.rerender({ id: second });
    expect(h.result.current).toEqual({
      catalogName: undefined,
      totalSongs: undefined,
    });
    await act(async () =>
      finish({ songs: [], pagination: { total_count: 999 } }),
    );
    expect(h.result.current).toEqual({
      catalogName: undefined,
      totalSongs: undefined,
    });
  });
  it("hides cached metadata immediately on workspace change", async () => {
    scope.org = "org-a";
    getCatalogs.mockResolvedValue({ catalogs: [catalog(second, "org-a")] });
    const h = setup();
    await waitFor(() => expect(h.result.current.totalSongs).toBe(245));
    scope.org = "org-b";
    h.rerender({ id: second });
    expect(h.result.current).toEqual({
      catalogName: undefined,
      totalSongs: undefined,
    });
    await waitFor(() => expect(getCatalogs).toHaveBeenCalledTimes(2));
    expect(h.result.current).toEqual({
      catalogName: undefined,
      totalSongs: undefined,
    });
  });
  it("hides the previous catalog while a new id resolves", async () => {
    const h = setup();
    await waitFor(() => expect(h.result.current.totalSongs).toBe(245));
    h.rerender({ id: first });
    expect(h.result.current).toEqual({
      catalogName: undefined,
      totalSongs: undefined,
    });
    await waitFor(() => expect(h.result.current.catalogName).toBe("First"));
  });
  it("hides identity and count on metadata error", async () => {
    getCatalogs.mockRejectedValue(new Error("unavailable"));
    const h = setup();
    await waitFor(() => expect(getCatalogs).toHaveBeenCalledOnce());
    expect(h.result.current).toEqual({
      catalogName: undefined,
      totalSongs: undefined,
    });
    expect(getCatalogSongs).not.toHaveBeenCalled();
  });
  it.each(["auth", "initialized"] as const)(
    "does not read with unresolved %s",
    (flag) => {
      scope[flag] = false;
      const h = setup();
      expect(h.result.current).toEqual({
        catalogName: undefined,
        totalSongs: undefined,
      });
      expect(getCatalogs).not.toHaveBeenCalled();
      expect(getCatalogSongs).not.toHaveBeenCalled();
    },
  );
});
