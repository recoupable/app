// @vitest-environment jsdom
import React from "react";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCatalogTaskSetup } from "../useCatalogTaskSetup";
const { scope, getCatalogs } = vi.hoisted(() => ({
  scope: {
    account: "account-a",
    org: null as string | null,
    auth: true,
    initialized: true,
  },
  getCatalogs: vi.fn(),
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
const first = "11111111-1111-4111-8111-111111111111",
  second = "22222222-2222-4222-8222-222222222222";
const catalog = (id: string, owner = "account-a") => ({
  id,
  name: id === first ? "First" : "Second",
  owner: { id: owner },
});
function setup(id: string | string[] = second) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return renderHook(({ id }) => useCatalogTaskSetup(id), {
    initialProps: { id },
    wrapper,
  });
}
beforeEach(() => {
  scope.account = "account-a";
  scope.org = null;
  scope.auth = true;
  scope.initialized = true;
  getCatalogs.mockReset();
  getCatalogs.mockResolvedValue({
    catalogs: [catalog(first), catalog(second)],
  });
});
afterEach(cleanup);
describe("catalog task scope", () => {
  it("resolves the second catalog by stable id", async () => {
    const h = setup();
    await waitFor(() => expect(h.result.current.state).toBe("unsupported"));
    expect(h.result.current.catalogName).toBe("Second");
    expect(getCatalogs).toHaveBeenCalledWith("account-a", "synthetic");
  });
  it.each(["", "bad", [first, second]])(
    "rejects malformed/duplicate input %j without a read",
    async (id) => {
      const h = setup(id);
      expect(h.result.current.state).toBe("invalid");
      expect(getCatalogs).not.toHaveBeenCalled();
    },
  );
  it("does not substitute the first catalog for a missing/foreign/removed id", async () => {
    getCatalogs.mockResolvedValue({ catalogs: [catalog(first)] });
    const h = setup();
    await waitFor(() => expect(h.result.current.state).toBe("missing"));
    expect(h.result.current.catalogName).toBeUndefined();
  });
  it("accepts the authorized org owner only in that workspace", async () => {
    scope.org = "org-a";
    getCatalogs.mockResolvedValue({ catalogs: [catalog(second, "org-a")] });
    const h = setup();
    await waitFor(() => expect(h.result.current.state).toBe("unsupported"));
    scope.org = "org-b";
    h.rerender({ id: second });
    expect(h.result.current.catalogName).toBeUndefined();
    await waitFor(() => expect(h.result.current.state).toBe("workspace"));
  });
  it("discards an old account response after switching", async () => {
    let finish!: (x: unknown) => void;
    getCatalogs
      .mockImplementationOnce(
        () =>
          new Promise((r) => {
            finish = r;
          }),
      )
      .mockResolvedValue({ catalogs: [] });
    const h = setup();
    await waitFor(() => expect(getCatalogs).toHaveBeenCalledOnce());
    scope.account = "account-b";
    h.rerender({ id: second });
    await waitFor(() => expect(h.result.current.state).toBe("missing"));
    await act(async () => finish({ catalogs: [catalog(second)] }));
    expect(h.result.current.state).toBe("missing");
    expect(h.result.current.catalogName).toBeUndefined();
  });
  it("clears the old name when the requested catalog changes", async () => {
    const h = setup();
    await waitFor(() => expect(h.result.current.state).toBe("unsupported"));
    h.rerender({ id: first });
    expect(h.result.current.catalogName).toBeUndefined();
    await waitFor(() => expect(h.result.current.catalogName).toBe("First"));
  });
  it("fails closed on read error and reauthorizes on retry", async () => {
    getCatalogs.mockRejectedValueOnce(new Error("private"));
    const h = setup();
    await waitFor(() => expect(h.result.current.state).toBe("error"));
    expect(h.result.current.catalogName).toBeUndefined();
    await act(async () => {
      await h.result.current.retry();
    });
    await waitFor(() => expect(h.result.current.state).toBe("unsupported"));
  });
  it("does not read when signed out", () => {
    scope.auth = false;
    const h = setup();
    expect(h.result.current.state).toBe("sign-in");
    expect(getCatalogs).not.toHaveBeenCalled();
  });
});
