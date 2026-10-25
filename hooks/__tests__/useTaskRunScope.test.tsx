// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  context,
  token,
  fetchMock,
  wrapper,
  response,
  deferred,
  client,
} from "./taskRunScope.fixture";
import { useTaskRuns } from "../useTaskRuns";
import { useTaskRunStatus } from "../useTaskRunStatus";
import { useChatRunStatus } from "../useChatRunStatus";

const readers = [
  ["list", (accountIdOverride?: string) => useTaskRuns({ accountIdOverride })],
  [
    "detail",
    (accountIdOverride?: string) =>
      useTaskRunStatus("same-run", { accountIdOverride }),
  ],
  [
    "workflow",
    (accountIdOverride?: string) =>
      useChatRunStatus("same-workflow", { accountIdOverride }),
  ],
] as const;
for (const [name, useReader] of readers) {
  describe(name, () => {
    it("blocks unresolved email instead of requesting self, and recovers after clear", async () => {
      context.email = "unresolved@example.test";
      const { result, rerender } = renderHook(() => useReader(), { wrapper });
      await act(async () => {});
      expect(fetchMock).not.toHaveBeenCalled();
      expect(result.current.scopeReady).toBe(false);
      expect(result.current.data).toBeUndefined();
      context.email = null;
      rerender();
      await waitFor(() => expect(result.current.data).toBeDefined());
    });
    it("URL selection wins over unresolved or conflicting global selection", async () => {
      context.email = "unresolved@example.test";
      const { result, rerender } = renderHook(() => useReader("url-account"), {
        wrapper,
      });
      await waitFor(() => expect(result.current.data).toBeDefined());
      expect(result.current.accountId).toBe("url-account");
      if (name !== "workflow")
        expect(
          new URL(fetchMock.mock.calls[0][0]).searchParams.get("account_id"),
        ).toBe("url-account");
      context.account = "global-account";
      rerender();
      expect(result.current.accountId).toBe("url-account");
    });
    it.each(["account", "actor", "origin", "authenticated"] as const)(
      "hides cached data immediately when %s changes",
      async (field) => {
        const { result, rerender } = renderHook(() => useReader(), { wrapper });
        await waitFor(() => expect(result.current.data).toBeDefined());
        fetchMock.mockReturnValue(new Promise(() => {}));
        if (field === "authenticated") context.authenticated = false;
        else
          context[field] =
            field === "origin" ? "https://new.example.test" : "other";
        rerender();
        expect(result.current.data).toBeUndefined();
      },
    );
    it("does not resurrect cached data after same-actor sign-out/sign-in", async () => {
      const { result, rerender } = renderHook(() => useReader(), { wrapper });
      await waitFor(() => expect(result.current.data).toBeDefined());
      context.authenticated = false;
      rerender();
      fetchMock.mockReturnValue(new Promise(() => {}));
      context.authenticated = true;
      rerender();
      expect(result.current.data).toBeUndefined();
    });
    it("a pending A to B to A switch recovers without accepting the original response", async () => {
      const pending = deferred<Response>();
      fetchMock.mockReturnValueOnce(pending.promise);
      const { result, rerender } = renderHook(() => useReader(), { wrapper });
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
      context.account = "account-b";
      rerender();
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
      context.account = null;
      fetchMock.mockResolvedValue(response("fresh"));
      rerender();
      await waitFor(() =>
        expect(JSON.stringify(result.current.data)).toContain("fresh"),
      );
      await act(async () => pending.resolve(response("obsolete")));
      expect(JSON.stringify(result.current.data)).toContain("fresh");
    });
    it("an empty explicit account does not fall back to global or self", async () => {
      context.account = "global-account";
      const { result } = renderHook(() => useReader(""), { wrapper });
      await act(async () => {});
      expect(fetchMock).not.toHaveBeenCalled();
      expect(result.current.scopeReady).toBe(false);
    });
    it("rejects stale token completion before sending a request", async () => {
      const pending = deferred<string>();
      token.mockReturnValueOnce(pending.promise);
      const { rerender } = renderHook(() => useReader(), { wrapper });
      await waitFor(() => expect(token).toHaveBeenCalledTimes(1));
      context.account = "account-b";
      rerender();
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
      await act(async () => pending.resolve("old-token"));
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
    it("aborts obsolete fetches and rejects late response completion", async () => {
      const pending = deferred<Response>();
      fetchMock.mockReturnValueOnce(pending.promise);
      const { result, rerender } = renderHook(() => useReader(), { wrapper });
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
      const signal = fetchMock.mock.calls[0][1].signal as AbortSignal;
      context.account = "account-b";
      rerender();
      await waitFor(() => expect(result.current.data).toBeDefined());
      expect(signal.aborted).toBe(true);
      await act(async () => pending.resolve(response("obsolete")));
      expect(
        JSON.stringify(
          client
            .getQueryCache()
            .findAll()
            .map((q) => q.state.data),
        ),
      ).not.toContain("obsolete");
    });
    it("rejects an origin change during token acquisition even without rerender", async () => {
      const pending = deferred<string>();
      token.mockReturnValueOnce(pending.promise);
      renderHook(() => useReader(), { wrapper });
      await waitFor(() => expect(token).toHaveBeenCalledTimes(1));
      context.origin = "https://new.example.test";
      await act(async () => pending.resolve("old-token"));
      expect(fetchMock).not.toHaveBeenCalled();
    });
    it("rejects missing tokens without an empty bearer request, then recovers", async () => {
      token.mockResolvedValue(null);
      const { result } = renderHook(() => useReader(), { wrapper });
      await waitFor(() => expect(token).toHaveBeenCalled());
      expect(fetchMock).not.toHaveBeenCalled();
      token.mockResolvedValue("fresh-token");
      await act(async () => {
        await result.current.refetch();
      });
      await waitFor(() => expect(result.current.data).toBeDefined());
    });
    it("never displays old success data after a denied refetch", async () => {
      const { result } = renderHook(() => useReader(), { wrapper });
      await waitFor(() => expect(result.current.data).toBeDefined());
      fetchMock.mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => ({ error: "Access denied" }),
      });
      await act(async () => {
        await result.current.refetch();
      });
      await waitFor(() => expect(result.current.data).toBeUndefined());
      expect(result.current.error?.message).toBe("Access denied");
    }, 15000);
  });
}

for (const [name, useReader] of readers.filter(([name]) => name !== "list")) {
  it(`${name} polls nonterminal runs every 3 seconds and stops on completion`, async () => {
    vi.useFakeTimers();
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "running",
        runs: [{ status: "EXECUTING", metadata: null }],
      }),
    });
    const { result } = renderHook(() => useReader(), { wrapper });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.current.data).toBeDefined();
    fetchMock.mockResolvedValue(response());
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(9000);
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
}
