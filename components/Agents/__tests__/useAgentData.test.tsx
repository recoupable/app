// @vitest-environment jsdom
import {
  state,
  token,
  fetchMock,
  wrapper,
  response,
  deferred,
  client,
} from "./templateScope.fixture";
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useAgentData } from "../useAgentData";

describe("authenticated template reads", () => {
  it("uses the dedicated API envelope and bearer without an identity override, preserving filters", async () => {
    const { result } = renderHook(useAgentData, { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://api.example.test/api/agents/templates",
    );
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe(
      "Bearer fresh-token",
    );
    expect(result.current.gridAgents.map((a) => a.id)).toEqual(["public"]);
    expect(result.current.tags).toEqual(["Recommended", "Marketing"]);
    act(() => result.current.togglePrivate());
    expect(result.current.gridAgents.map((a) => a.id)).toEqual(["template-a"]);
    act(() => result.current.setSelectedTag("Other"));
    expect(result.current.gridAgents).toEqual([]);
  });
  it("keeps templates with the actor when the roster account selection changes", async () => {
    const { result, rerender } = renderHook(useAgentData, { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    state.selection = "roster-b";
    rerender();
    expect(result.current.gridAgents[0].id).toBe("public");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).not.toContain("account_id");
  });
  it("rejects an origin change during token acquisition without a render", async () => {
    const pending = deferred<string>();
    token.mockReturnValueOnce(pending.promise);
    renderHook(useAgentData, { wrapper });
    await waitFor(() => expect(token).toHaveBeenCalled());
    state.origin = "https://other.example.test";
    await act(async () => pending.resolve("old-token"));
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it.each(["actor", "account", "origin", "authenticated"] as const)(
    "masks cached and copied private data immediately on %s changes",
    async (field) => {
      const { result, rerender } = renderHook(useAgentData, { wrapper });
      await waitFor(() => expect(result.current.loading).toBe(false));
      act(() => result.current.togglePrivate());
      expect(result.current.gridAgents[0].id).toBe("template-a");
      fetchMock.mockReturnValue(new Promise(() => {}));
      if (field === "authenticated") state.authenticated = false;
      else
        state[field] =
          field === "origin" ? "https://other.example.test" : "other";
      rerender();
      expect(result.current.gridAgents).toEqual([]);
      expect(result.current.tags).toEqual(["Recommended"]);
    },
  );
  it("does not restore prior cache on same-actor relogin", async () => {
    const { result, rerender } = renderHook(useAgentData, { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    state.authenticated = false;
    rerender();
    fetchMock.mockReturnValue(new Promise(() => {}));
    state.authenticated = true;
    rerender();
    expect(result.current.gridAgents).toEqual([]);
  });
  it("rejects late tokens before fetch and late responses after logout", async () => {
    const delayedToken = deferred<string>();
    token.mockReturnValueOnce(delayedToken.promise);
    const { result, rerender } = renderHook(useAgentData, { wrapper });
    await waitFor(() => expect(token).toHaveBeenCalled());
    state.authenticated = false;
    rerender();
    await act(async () => delayedToken.resolve("old-token"));
    expect(fetchMock).not.toHaveBeenCalled();
    const pending = deferred<ReturnType<typeof response>>();
    fetchMock.mockReturnValueOnce(pending.promise);
    state.authenticated = true;
    rerender();
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const signal = fetchMock.mock.calls[0][1].signal;
    state.authenticated = false;
    rerender();
    await act(async () => pending.resolve(response("obsolete")));
    expect(signal.aborted).toBe(true);
    expect(result.current.gridAgents).toEqual([]);
    expect(
      JSON.stringify(
        client
          .getQueryCache()
          .getAll()
          .map((q) => q.state.data),
      ),
    ).not.toContain("obsolete");
  });
  it("fails missing tokens, recovers explicitly, and masks success after denial", async () => {
    token.mockResolvedValue(null);
    const { result } = renderHook(useAgentData, { wrapper });
    await waitFor(() => expect(result.current.error).toBeTruthy());
    expect(fetchMock).not.toHaveBeenCalled();
    token.mockResolvedValue("recovered");
    await act(async () => {
      await result.current.refetch();
    });
    await waitFor(() => expect(result.current.gridAgents).toHaveLength(1));
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ status: "error", error: "Forbidden" }),
    });
    await act(async () => {
      await result.current.refetch();
    });
    await waitFor(() => expect(result.current.gridAgents).toEqual([]));
  });
});
