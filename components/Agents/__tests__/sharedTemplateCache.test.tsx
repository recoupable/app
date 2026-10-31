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
import React from "react";
import { act, render, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QueryClientProvider } from "@tanstack/react-query";
import { AgentTemplateProvider } from "@/providers/AgentTemplateProvider";
import { useAgentData } from "../useAgentData";
import { useAgentTemplateMutation } from "../useAgentTemplateMutation";

const getCount = () =>
  fetchMock.mock.calls.filter(([, options]) => options.method === "GET").length;

describe("shared template session cache", () => {
  it("deduplicates simultaneous page and form readers into one request/cache", async () => {
    const { result } = renderHook(
      () => ({ page: useAgentData(), form: useAgentData() }),
      { wrapper },
    );
    await waitFor(() =>
      expect(result.current.page.loading || result.current.form.loading).toBe(
        false,
      ),
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(client.getQueryCache().getAll()).toHaveLength(1);
    expect(result.current.page.gridAgents).toEqual(
      result.current.form.gridAgents,
    );
  });

  it("hover prefetch warms the page without a duplicate fetch", async () => {
    const observed: Record<string, ReturnType<typeof useAgentData>> = {};
    function Reader({
      name,
      enabled = true,
    }: {
      name: string;
      enabled?: boolean;
    }) {
      observed[name] = useAgentData({ enabled });
      return null;
    }
    const { rerender } = render(<Reader name="nav" enabled={false} />, {
      wrapper,
    });
    await act(async () => {});
    expect(fetchMock).not.toHaveBeenCalled();
    act(() => observed.nav.prefetchAgents());
    await waitFor(() => expect(observed.nav.gridAgents).toHaveLength(1));
    rerender(
      <>
        <Reader name="nav" enabled={false} />
        <Reader name="page" />
      </>,
    );
    await waitFor(() => expect(observed.page.gridAgents).toHaveLength(1));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(client.getQueryCache().getAll()).toHaveLength(1);
  });

  it("one mutation invalidation refetches once for every mounted reader", async () => {
    const { result } = renderHook(
      () => ({
        page: useAgentData(),
        form: useAgentData(),
        mutation: useAgentTemplateMutation(),
      }),
      { wrapper },
    );
    await waitFor(() =>
      expect(result.current.page.loading || result.current.form.loading).toBe(
        false,
      ),
    );
    expect(getCount()).toBe(1);
    await act(async () =>
      result.current.mutation.mutate({
        method: "POST",
        body: { title: "Updated" },
      }),
    );
    await waitFor(() => expect(getCount()).toBe(2));
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("keeps a deduplicated request alive when its first reader unmounts", async () => {
    const pending = deferred<ReturnType<typeof response>>();
    fetchMock.mockReturnValueOnce(pending.promise);
    const observed: Record<string, ReturnType<typeof useAgentData>> = {};
    function Reader({ name }: { name: string }) {
      observed[name] = useAgentData();
      return null;
    }
    const { rerender } = render(
      <>
        <Reader key="first" name="first" />
        <Reader key="second" name="second" />
      </>,
      { wrapper },
    );
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const signal = fetchMock.mock.calls[0][1].signal;
    rerender(
      <>
        {false}
        <Reader key="second" name="second" />
      </>,
    );
    expect(signal.aborted).toBe(false);
    await act(async () => pending.resolve(response()));
    await waitFor(() => expect(observed.second.gridAgents).toHaveLength(1));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("does not let same-actor logout/login revive either consumer's private cache", async () => {
    const { result, rerender } = renderHook(
      () => ({ page: useAgentData(), form: useAgentData() }),
      { wrapper },
    );
    await waitFor(() =>
      expect(result.current.page.loading || result.current.form.loading).toBe(
        false,
      ),
    );
    act(() => {
      result.current.page.togglePrivate();
      result.current.form.togglePrivate();
    });
    expect(result.current.page.gridAgents).toHaveLength(1);
    const oldKeys = client
      .getQueryCache()
      .getAll()
      .map((q) => q.queryHash);
    state.authenticated = false;
    rerender();
    expect(result.current.page.gridAgents).toEqual([]);
    expect(result.current.form.gridAgents).toEqual([]);
    fetchMock.mockReturnValue(new Promise(() => {}));
    state.authenticated = true;
    rerender();
    expect(result.current.page.gridAgents).toEqual([]);
    expect(result.current.form.gridAgents).toEqual([]);
    expect(
      client
        .getQueryCache()
        .getAll()
        .filter((q) => q.isActive())
        .map((q) => q.queryHash),
    ).not.toEqual(oldKeys);
  });
  it.each(["token", "response"] as const)(
    "cancels an unmounted mutation consumer at the %s boundary without disrupting its shared provider",
    async (stage) => {
      let mutation!: ReturnType<typeof useAgentTemplateMutation>;
      function Mutator() {
        mutation = useAgentTemplateMutation();
        return null;
      }
      function Reader() {
        useAgentData();
        return null;
      }
      const { rerender } = render(
        <>
          <Reader key="reader" />
          <Mutator key="mutation" />
        </>,
        { wrapper },
      );
      await waitFor(() => expect(getCount()).toBe(1));
      const lateToken = deferred<string>();
      const lateResponse = deferred<ReturnType<typeof response>>();
      if (stage === "token") token.mockReturnValueOnce(lateToken.promise);
      else fetchMock.mockReturnValueOnce(lateResponse.promise);
      const onSuccess = vi.fn();
      const invalidate = vi.spyOn(client, "invalidateQueries");
      let work!: Promise<void>;
      act(() => {
        work = mutation.mutate({ method: "POST", body: {} }, onSuccess);
      });
      await waitFor(() =>
        expect(
          stage === "token"
            ? token.mock.calls.length
            : fetchMock.mock.calls.length,
        ).toBe(2),
      );
      const signal =
        stage === "response" ? fetchMock.mock.calls[1][1].signal : null;
      rerender(
        <>
          <Reader key="reader" />
          {false}
        </>,
      );
      if (signal) expect(signal.aborted).toBe(true);
      await act(async () => {
        if (stage === "token") lateToken.resolve("late-token");
        else lateResponse.resolve(response());
        await work;
      });
      expect(onSuccess).not.toHaveBeenCalled();
      expect(invalidate).not.toHaveBeenCalled();
      expect(fetchMock).toHaveBeenCalledTimes(stage === "token" ? 1 : 2);
    },
  );

  it("does not reuse private data after the entire session provider remounts", async () => {
    let reader!: ReturnType<typeof useAgentData>;
    function Reader() {
      reader = useAgentData();
      return null;
    }
    const tree = (key: string) => (
      <QueryClientProvider client={client}>
        <AgentTemplateProvider key={key}>
          <Reader />
        </AgentTemplateProvider>
      </QueryClientProvider>
    );
    const { rerender } = render(tree("first"));
    await waitFor(() => expect(reader.loading).toBe(false));
    const oldScope = reader.scopeKey;
    fetchMock.mockReturnValue(new Promise(() => {}));
    rerender(tree("second"));
    expect(reader.scopeKey).not.toBe(oldScope);
    expect(reader.gridAgents).toEqual([]);
  });
});
