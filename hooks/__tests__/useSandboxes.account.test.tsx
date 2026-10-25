// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { expect, it } from "vitest";
import {
  context,
  token,
  fetchMock,
  wrapper,
  response,
  client,
} from "./sandboxAccount.fixture";
import useSandboxes from "../useSandboxes";

it("propagates the selected account and never reuses another account's listing", async () => {
  fetchMock.mockImplementation(async (url: string) =>
    response({
      account_id: new URL(url).searchParams.get("account_id"),
      sandboxes: [
        { sandboxId: new URL(url).searchParams.get("account_id") ?? "self" },
      ],
      filetree: [],
    }),
  );
  const { result, rerender } = renderHook(() => useSandboxes(), { wrapper });
  await waitFor(() =>
    expect(result.current.sandboxes[0]?.sandboxId).toBe("self"),
  );
  context.account = "selected-b";
  rerender();
  expect(result.current.sandboxes).toEqual([]);
  await waitFor(() =>
    expect(result.current.sandboxes[0]?.sandboxId).toBe("selected-b"),
  );
  context.account = "selected-c";
  rerender();
  expect(result.current.sandboxes).toEqual([]);
  await waitFor(() =>
    expect(result.current.sandboxes[0]?.sandboxId).toBe("selected-c"),
  );
});

it.each(["actor", "origin"] as const)(
  "isolates cached listings when %s changes",
  async (field) => {
    fetchMock.mockResolvedValue(
      response({ sandboxes: [{ sandboxId: "first" }], filetree: [] }),
    );
    const { result, rerender } = renderHook(() => useSandboxes(), { wrapper });
    await waitFor(() => expect(result.current.sandboxes).toHaveLength(1));
    fetchMock.mockResolvedValue(
      response({ sandboxes: [{ sandboxId: "second" }], filetree: [] }),
    );
    context[field] = field === "actor" ? "actor-b" : "https://other.example";
    rerender();
    expect(result.current.sandboxes).toEqual([]);
    await waitFor(() =>
      expect(result.current.sandboxes[0]?.sandboxId).toBe("second"),
    );
  },
);

it("does not issue a stale request when the account changes during token acquisition", async () => {
  let release!: (token: string) => void;
  token.mockReturnValueOnce(
    new Promise((resolve) => {
      release = resolve;
    }),
  );
  fetchMock.mockResolvedValue(
    response({ account_id: "selected-b", sandboxes: [], filetree: [] }),
  );
  const { rerender } = renderHook(() => useSandboxes(), { wrapper });
  await waitFor(() => expect(token).toHaveBeenCalledTimes(1));
  context.account = "selected-b";
  rerender();
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  await act(async () => release("old-token"));
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

it("discards a response that arrives after selecting a different account", async () => {
  let release!: (response: Response) => void;
  fetchMock.mockReturnValueOnce(
    new Promise((resolve) => {
      release = resolve;
    }),
  );
  const { result, rerender } = renderHook(() => useSandboxes(), { wrapper });
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  context.account = "selected-b";
  fetchMock.mockResolvedValue(
    response({
      account_id: "selected-b",
      sandboxes: [{ sandboxId: "b" }],
      filetree: [],
    }),
  );
  rerender();
  await waitFor(() => expect(result.current.sandboxes[0]?.sandboxId).toBe("b"));
  await act(async () =>
    release(response({ sandboxes: [{ sandboxId: "old" }], filetree: [] })),
  );
  expect(result.current.sandboxes[0]?.sandboxId).toBe("b");
  expect(
    client
      .getQueryCache()
      .findAll()
      .some((q) => (JSON.stringify(q.state.data) ?? "").includes('"old"')),
  ).toBe(false);
});

it("does not fall back to the signed-in account while an email override resolves", async () => {
  context.email = "selected@example.test";
  const { result } = renderHook(() => useSandboxes(), { wrapper });
  await act(async () => {});
  expect(fetchMock).not.toHaveBeenCalled();
  expect(result.current.sandboxes).toEqual([]);
});

it("hides the previous listing on sign-out", async () => {
  fetchMock.mockResolvedValue(
    response({ sandboxes: [{ sandboxId: "private" }], filetree: [] }),
  );
  const { result, rerender } = renderHook(() => useSandboxes(), { wrapper });
  await waitFor(() => expect(result.current.sandboxes).toHaveLength(1));
  context.actor = null;
  rerender();
  expect(result.current.sandboxes).toEqual([]);
});

it("restarts a pending listing after switching away and back", async () => {
  let release!: (value: Response) => void;
  fetchMock.mockReturnValueOnce(
    new Promise((resolve) => {
      release = resolve;
    }),
  );
  const { result, rerender } = renderHook(() => useSandboxes(), { wrapper });
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  context.account = "selected-b";
  fetchMock.mockResolvedValueOnce(
    response({ account_id: "selected-b", sandboxes: [], filetree: [] }),
  );
  rerender();
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  context.account = null;
  fetchMock.mockResolvedValue(
    response({ sandboxes: [{ sandboxId: "fresh" }], filetree: [] }),
  );
  rerender();
  await waitFor(() =>
    expect(result.current.sandboxes[0]?.sandboxId).toBe("fresh"),
  );
  await act(async () =>
    release(response({ sandboxes: [{ sandboxId: "old" }], filetree: [] })),
  );
  expect(result.current.sandboxes[0]?.sandboxId).toBe("fresh");
});
