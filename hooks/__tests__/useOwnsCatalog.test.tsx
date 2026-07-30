// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import useOwnsCatalog from "@/hooks/useOwnsCatalog";

const catalogsQuery: {
  data?: { catalogs: { id: string }[] };
  isSuccess: boolean;
  isError: boolean;
} = { data: undefined, isSuccess: false, isError: false };

vi.mock("@/hooks/useCatalogs", () => ({
  default: () => catalogsQuery,
}));

describe("useOwnsCatalog", () => {
  beforeEach(() => {
    catalogsQuery.data = undefined;
    catalogsQuery.isSuccess = false;
    catalogsQuery.isError = false;
  });

  /**
   * Review finding (cubic P1 / codex P2, 2026-07-30). useCatalogs is
   * `enabled: !!accountId && authenticated`, and a disabled TanStack Query v5
   * query reports isPending true / isFetching false — so `isLoading` is false
   * while Privy and the account are still resolving. Deriving "resolved" from
   * !isLoading therefore called a signed-in owner a stranger for the first
   * frames, and the report announced "measured by another account" on their
   * own catalog. Same trap already documented in SetupValuation.
   */
  it("is unresolved while the catalog query is disabled or pending", () => {
    const { result } = renderHook(() => useOwnsCatalog("cat-1"));

    expect(result.current.isResolved).toBe(false);
    expect(result.current.ownsCatalog).toBe(false);
  });

  it("resolves ownership once the list loads", () => {
    catalogsQuery.isSuccess = true;
    catalogsQuery.data = { catalogs: [{ id: "cat-1" }] };

    const { result } = renderHook(() => useOwnsCatalog("cat-1"));

    expect(result.current.isResolved).toBe(true);
    expect(result.current.ownsCatalog).toBe(true);
  });

  it("resolves a genuine non-ownership answer", () => {
    catalogsQuery.isSuccess = true;
    catalogsQuery.data = { catalogs: [{ id: "someone-elses" }] };

    const { result } = renderHook(() => useOwnsCatalog("cat-1"));

    expect(result.current.isResolved).toBe(true);
    expect(result.current.ownsCatalog).toBe(false);
  });

  it("reports ownership as unknown when the list fails to load", () => {
    catalogsQuery.isError = true;

    const { result } = renderHook(() => useOwnsCatalog("cat-1"));

    expect(result.current.isResolved).toBe(true);
    expect(result.current.ownershipUnknown).toBe(true);
  });

  it("is unresolved without a catalog id", () => {
    catalogsQuery.isSuccess = true;
    catalogsQuery.data = { catalogs: [{ id: "cat-1" }] };

    const { result } = renderHook(() => useOwnsCatalog(undefined));

    expect(result.current.ownsCatalog).toBe(false);
  });
});
