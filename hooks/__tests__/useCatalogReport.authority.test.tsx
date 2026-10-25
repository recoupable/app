// @vitest-environment jsdom
import React from "react";
import {
  act,
  cleanup,
  renderHook,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import useCatalogReport from "../useCatalogReport";
import CatalogReportContent from "@/components/Catalog/report/CatalogReportContent";
const { scope, getCatalogs, getCatalogSongs, getCatalogMeasurements } =
  vi.hoisted(() => ({
    scope: {
      actor: "actor-a",
      account: "account-a",
      org: null as string | null,
      auth: true,
      initialized: true,
    },
    getCatalogs: vi.fn(),
    getCatalogSongs: vi.fn(),
    getCatalogMeasurements: vi.fn(),
  }));
vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({
    ready: true,
    authenticated: scope.auth,
    user: { id: scope.actor },
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
vi.mock("@/lib/catalog/getCatalogMeasurements", () => ({
  getCatalogMeasurements,
}));
const first = "11111111-1111-4111-8111-111111111111",
  second = "22222222-2222-4222-8222-222222222222";
const catalog = (id: string, owner = "account-a") => ({
  id,
  name: id === first ? "First" : "Second",
  owner: { id: owner },
});
function setup(id = second) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return {
    ...renderHook(({ id }) => useCatalogReport(id), {
      initialProps: { id },
      wrapper,
    }),
    client,
  };
}
beforeEach(() => {
  scope.actor = "actor-a";
  scope.account = "account-a";
  scope.org = null;
  scope.auth = true;
  scope.initialized = true;
  getCatalogMeasurements.mockReset();
  getCatalogMeasurements.mockResolvedValue({
    measurements: [{ isrc: "OLD", playcount: 100 }],
    total_streams: 100,
    measured_song_count: 5,
  });
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
describe("whole report authority", () => {
  it.each(["account", "org", "actor"] as const)(
    "clears all body data on %s transition and rejects late old responses",
    async (field) => {
      let finish!: (x: unknown) => void;
      getCatalogMeasurements.mockImplementationOnce(
        () =>
          new Promise((r) => {
            finish = r;
          }),
      );
      const h = setup();
      await waitFor(() =>
        expect(getCatalogMeasurements).toHaveBeenCalledOnce(),
      );
      scope[field] =
        field === "account"
          ? "account-b"
          : field === "org"
            ? "org-b"
            : "actor-b";
      getCatalogs.mockResolvedValue({ catalogs: [] });
      h.rerender({ id: second });
      expect(h.result.current.measurements).toBeUndefined();
      expect(h.result.current.songs).toBeUndefined();
      expect(h.result.current.totalSongs).toBeUndefined();
      await act(async () =>
        finish({
          measurements: [{ isrc: "OLD", playcount: 100 }],
          total_streams: 100,
        }),
      );
      await waitFor(() => expect(h.result.current.state).not.toBe("loading"));
      expect(h.result.current.measurements).toBeUndefined();
      expect(h.result.current.songs).toBeUndefined();
      expect(getCatalogMeasurements).toHaveBeenCalledOnce();
    },
  );
  it("removes a cached ready report immediately on workspace change", async () => {
    const h = setup();
    await waitFor(() => expect(h.result.current.state).toBe("ready"));
    scope.org = "elsewhere";
    h.rerender({ id: second });
    expect(h.result.current.measurements).toBeUndefined();
    expect(h.result.current.songs).toBeUndefined();
    await waitFor(() => expect(h.result.current.state).not.toBe("loading"));
    expect(h.result.current.measurements).toBeUndefined();
  });
  it("reads measurements and one bounded song page only after catalog authorization", async () => {
    getCatalogs.mockResolvedValue({ catalogs: [] });
    const h = setup();
    await waitFor(() => expect(h.result.current.state).not.toBe("loading"));
    expect(getCatalogSongs).not.toHaveBeenCalled();
    expect(getCatalogMeasurements).not.toHaveBeenCalled();
  });
  it("clears a prior catalog while the new catalog authorizes", async () => {
    const h = setup();
    await waitFor(() => expect(h.result.current.state).toBe("ready"));
    getCatalogs.mockImplementationOnce(() => new Promise(() => {}));
    h.rerender({ id: first });
    expect(h.result.current.state).toBe("loading");
    expect(h.result.current.measurements).toBeUndefined();
    expect(h.result.current.songs).toBeUndefined();
  });
  it.each(["auth", "initialized"] as const)(
    "clears cached data when %s is unavailable",
    async (flag) => {
      const h = setup();
      await waitFor(() => expect(h.result.current.state).toBe("ready"));
      scope[flag] = false;
      h.rerender({ id: second });
      expect(h.result.current.measurements).toBeUndefined();
      expect(h.result.current.songs).toBeUndefined();
    },
  );
  it("reauthorizes a new account before reading its own fresh report", async () => {
    const h = setup();
    await waitFor(() => expect(h.result.current.state).toBe("ready"));
    scope.account = "account-b";
    getCatalogs.mockResolvedValue({ catalogs: [catalog(second, "account-b")] });
    getCatalogMeasurements.mockResolvedValue({
      measurements: [{ isrc: "NEW", playcount: 7 }],
      total_streams: 7,
    });
    h.rerender({ id: second });
    expect(h.result.current.measurements).toBeUndefined();
    await waitFor(() =>
      expect(h.result.current.measurements?.total_streams).toBe(7),
    );
    expect(getCatalogSongs).toHaveBeenCalledTimes(2);
    expect(getCatalogSongs).toHaveBeenLastCalledWith(
      "synthetic",
      second,
      100,
      1,
    );
  });
  it("retains unknown total after songs failure, without exposing stale release rows", async () => {
    getCatalogSongs.mockRejectedValue(new Error("failure"));
    const h = setup();
    await waitFor(() => expect(h.result.current.state).toBe("ready"));
    expect(h.result.current.totalSongs).toBeUndefined();
    expect(h.result.current.songs).toBeUndefined();
  });
});

describe("actual report body totals", () => {
  it.each([undefined, 0, 245])(
    "renders total %s without a measured-count substitute",
    async (total) => {
      getCatalogSongs.mockResolvedValue({
        songs: [],
        pagination: { total_count: total },
      });
      const client = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });
      render(
        <QueryClientProvider client={client}>
          <CatalogReportContent catalogId={second} />
        </QueryClientProvider>,
      );
      const expected =
        total === undefined ? "5 measured · total unknown" : `5 of ${total}`;
      await waitFor(() => expect(screen.getByText(expected)).toBeTruthy());
      if (total === undefined) {
        expect(screen.queryByText("5 of 5")).toBeNull();
        expect(
          screen.queryByText("Unmeasured tracks are suppressing this value"),
        ).toBeNull();
      }
    },
  );
  it("retains measured count but marks total unknown after songs failure", async () => {
    getCatalogSongs.mockRejectedValue(new Error("failure"));
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={client}>
        <CatalogReportContent catalogId={second} />
      </QueryClientProvider>,
    );
    await waitFor(() =>
      expect(screen.getByText("5 measured · total unknown")).toBeTruthy(),
    );
    expect(screen.queryByText("5 of 5")).toBeNull();
    expect(screen.getByText("Unknown")).toBeTruthy();
  });
});
