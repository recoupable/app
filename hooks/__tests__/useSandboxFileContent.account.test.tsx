// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { expect, it } from "vitest";
import {
  context,
  token,
  fetchMock,
  wrapper,
  response,
} from "./sandboxAccount.fixture";
import useSandboxFileContent from "../useSandboxFileContent";

it("hides a cached revision on authentication loss even if Privy retains the user id", async () => {
  fetchMock.mockResolvedValue(
    response({ content: "private A", sha: "a".repeat(40) }),
  );
  const { result, rerender } = renderHook(
    () => useSandboxFileContent({ path: "draft.txt", includeRevision: true }),
    { wrapper },
  );
  await waitFor(() => expect(result.current.openedRevision).toBeDefined());
  context.authenticated = false;
  rerender();
  expect(result.current.content).toBeNull();
  expect(result.current.openedRevision).toBeUndefined();
});

it("scopes previews to the selected account and never grants an override a writable revision", async () => {
  fetchMock.mockImplementation(async (url: string) =>
    response({
      account_id: new URL(url).searchParams.get("account_id"),
      content: new URL(url).searchParams.get("account_id") ?? "self",
      sha: "a".repeat(40),
    }),
  );
  const { result, rerender } = renderHook(
    () =>
      useSandboxFileContent({ path: "notes/a b.txt", includeRevision: true }),
    { wrapper },
  );
  await waitFor(() => expect(result.current.openedRevision).toBeDefined());
  const oldScope = result.current.scopeKey;
  context.account = "selected-b";
  rerender();
  expect(result.current.content).toBeNull();
  expect(result.current.openedRevision).toBeUndefined();
  await waitFor(() => expect(result.current.content).toBe("selected-b"));
  expect(result.current.scopeKey).not.toBe(oldScope);
  expect(result.current.openedRevision).toBeUndefined();
  const url = new URL(fetchMock.mock.calls.at(-1)![0]);
  expect(url.searchParams.get("path")).toBe("notes/a b.txt");
  expect(url.searchParams.has("include_revision")).toBe(false);
});

it("rejects a late token acquired for a different override", async () => {
  context.account = "selected-a";
  let release!: (token: string) => void;
  token.mockReturnValueOnce(
    new Promise((resolve) => {
      release = resolve;
    }),
  );
  fetchMock.mockResolvedValue(
    response({ account_id: "selected-b", content: "B" }),
  );
  const { result, rerender } = renderHook(
    () => useSandboxFileContent({ path: "draft.txt" }),
    { wrapper },
  );
  await waitFor(() => expect(token).toHaveBeenCalledTimes(1));
  context.account = "selected-b";
  rerender();
  await waitFor(() => expect(result.current.content).toBe("B"));
  await act(async () => release("old-token"));
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

it("does not leak late preview content into the newly selected account", async () => {
  let release!: (response: Response) => void;
  fetchMock.mockReturnValueOnce(
    new Promise((resolve) => {
      release = resolve;
    }),
  );
  const { result, rerender } = renderHook(
    () => useSandboxFileContent({ path: "draft.txt" }),
    { wrapper },
  );
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  context.account = "selected-b";
  fetchMock.mockResolvedValue(
    response({ account_id: "selected-b", content: "B" }),
  );
  rerender();
  await waitFor(() => expect(result.current.content).toBe("B"));
  await act(async () => release(response({ content: "private A" })));
  expect(result.current.content).toBe("B");
});

it("restarts a pending preview after switching away and back", async () => {
  let release!: (value: Response) => void;
  fetchMock.mockReturnValueOnce(
    new Promise((resolve) => {
      release = resolve;
    }),
  );
  const { result, rerender } = renderHook(
    () => useSandboxFileContent({ path: "draft.txt" }),
    { wrapper },
  );
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  context.account = "selected-b";
  fetchMock.mockResolvedValueOnce(
    response({ account_id: "selected-b", content: "B" }),
  );
  rerender();
  await waitFor(() => expect(result.current.content).toBe("B"));
  context.account = null;
  fetchMock.mockResolvedValue(response({ content: "fresh" }));
  rerender();
  await waitFor(() => expect(result.current.content).toBe("fresh"));
  await act(async () => release(response({ content: "old" })));
  expect(result.current.content).toBe("fresh");
});
