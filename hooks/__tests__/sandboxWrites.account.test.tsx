// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { expect, it, vi, beforeEach } from "vitest";
import {
  context,
  token,
  fetchMock,
  wrapper,
  response,
} from "./sandboxAccount.fixture";
import { useSandboxFileDrop } from "../useSandboxFileDrop";
import useDeleteSandbox from "../useDeleteSandbox";
import { useGuardedFileReplacement } from "../useGuardedFileReplacement";
import { stageSandboxFiles } from "@/lib/sandboxes/stageSandboxFiles";

vi.mock("@/lib/sandboxes/stageSandboxFiles", () => ({
  stageSandboxFiles: vi.fn(),
}));
const files = [new File(["replacement"], "draft.txt")];
const dropOptions = { selectedPath: "notes", filetree: [], refetch: vi.fn() };
beforeEach(() => {
  vi.mocked(stageSandboxFiles)
    .mockReset()
    .mockResolvedValue({
      blobFiles: [{ name: "draft.txt", url: "https://blob.example/draft.txt" }],
      blobErrors: [],
    });
  fetchMock.mockResolvedValue(
    response({ uploaded: [{ path: "notes/draft.txt", sha: "b".repeat(40) }] }),
  );
});

it("blocks upload and delete before obtaining credentials when reading another account", async () => {
  context.account = "selected-b";
  const drop = renderHook(() => useSandboxFileDrop(dropOptions), { wrapper });
  const deletion = renderHook(() => useDeleteSandbox(), { wrapper });
  act(() => drop.result.current.handleFilesDropped(files));
  await act(async () => {
    await expect(deletion.result.current.deleteSandbox()).rejects.toThrow(
      /read.only/i,
    );
  });
  await waitFor(() => expect(drop.result.current.uploading).toBe(false));
  expect(token).not.toHaveBeenCalled();
  expect(stageSandboxFiles).not.toHaveBeenCalled();
  expect(fetchMock).not.toHaveBeenCalled();
});

it("blocks a pending upload if account selection changes while obtaining credentials", async () => {
  let release!: (token: string) => void;
  token.mockReturnValueOnce(
    new Promise((resolve) => {
      release = resolve;
    }),
  );
  const { result, rerender } = renderHook(
    () => useSandboxFileDrop(dropOptions),
    { wrapper },
  );
  act(() => result.current.handleFilesDropped(files));
  await waitFor(() => expect(token).toHaveBeenCalledTimes(1));
  context.account = "selected-b";
  rerender();
  await act(async () => release("old-token"));
  await waitFor(() => expect(result.current.uploading).toBe(false));
  expect(stageSandboxFiles).not.toHaveBeenCalled();
  expect(fetchMock).not.toHaveBeenCalled();
});

it("blocks pending uploads when authentication is lost without clearing the user id", async () => {
  let release!: (token: string) => void;
  token.mockReturnValueOnce(
    new Promise((resolve) => {
      release = resolve;
    }),
  );
  const { result, rerender } = renderHook(
    () => useSandboxFileDrop(dropOptions),
    { wrapper },
  );
  act(() => result.current.handleFilesDropped(files));
  await waitFor(() => expect(token).toHaveBeenCalledTimes(1));
  context.authenticated = false;
  rerender();
  await act(async () => release("old-token"));
  await waitFor(() => expect(result.current.uploading).toBe(false));
  expect(stageSandboxFiles).not.toHaveBeenCalled();
  expect(fetchMock).not.toHaveBeenCalled();
});

it("blocks the commit if selection changes after blob staging begins", async () => {
  let release!: (value: Awaited<ReturnType<typeof stageSandboxFiles>>) => void;
  vi.mocked(stageSandboxFiles).mockReturnValueOnce(
    new Promise((resolve) => {
      release = resolve;
    }),
  );
  const { result, rerender } = renderHook(
    () => useSandboxFileDrop(dropOptions),
    { wrapper },
  );
  act(() => result.current.handleFilesDropped(files));
  await waitFor(() => expect(stageSandboxFiles).toHaveBeenCalledTimes(1));
  context.account = "selected-b";
  rerender();
  await act(async () => release({ blobFiles: [], blobErrors: [] }));
  await waitFor(() => expect(result.current.uploading).toBe(false));
  expect(fetchMock).not.toHaveBeenCalled();
});

it("blocks a pending deletion after switching account", async () => {
  let release!: (token: string) => void;
  token.mockReturnValueOnce(
    new Promise((resolve) => {
      release = resolve;
    }),
  );
  const { result, rerender } = renderHook(() => useDeleteSandbox(), {
    wrapper,
  });
  let deletion!: Promise<void>;
  act(() => {
    deletion = result.current.deleteSandbox();
  });
  const rejected = expect(deletion).rejects.toThrow(/changed|read.only/i);
  await waitFor(() => expect(token).toHaveBeenCalledTimes(1));
  context.account = "selected-b";
  rerender();
  await act(async () => {
    release("old-token");
    await rejected;
  });
  expect(fetchMock).not.toHaveBeenCalled();
});

it("does not accept a protected replacement while an override is active", async () => {
  context.account = "selected-b";
  const { result } = renderHook(() =>
    useGuardedFileReplacement({
      enabled: true,
      opened: {
        path: "notes/draft.txt",
        sha: "a".repeat(40),
        apiBaseUrl: context.origin,
        scopeKey: "actor-a",
      },
      scopeKey: "actor-a",
      selectedPath: "notes/draft.txt",
      onSaved: vi.fn(),
    }),
  );
  await act(async () => result.current.replace(files));
  expect(stageSandboxFiles).not.toHaveBeenCalled();
  expect(fetchMock).not.toHaveBeenCalled();
});

it("retains a protected replacement without committing after an override switch", async () => {
  let release!: (token: string) => void;
  token.mockReturnValueOnce(
    new Promise((resolve) => {
      release = resolve;
    }),
  );
  const options = {
    enabled: true,
    opened: {
      path: "notes/draft.txt",
      sha: "a".repeat(40),
      apiBaseUrl: context.origin,
      scopeKey: "actor-a",
    },
    scopeKey: "actor-a",
    selectedPath: "notes/draft.txt",
    onSaved: vi.fn(),
  };
  const { result, rerender } = renderHook(() =>
    useGuardedFileReplacement({
      ...options,
      scopeKey: context.account ? "selected-b-scope" : options.scopeKey,
    }),
  );
  let replacement!: Promise<void>;
  act(() => {
    replacement = result.current.replace(files);
  });
  await waitFor(() => expect(token).toHaveBeenCalledTimes(1));
  context.account = "selected-b";
  rerender();
  await act(async () => {
    release("old-token");
    await replacement;
  });
  expect(fetchMock).not.toHaveBeenCalled();
  expect(stageSandboxFiles).not.toHaveBeenCalled();
  expect(result.current.pending).toBeNull();
  expect(result.current.hasPending).toBe(true);
  context.account = null;
  rerender();
  expect(result.current.pending?.file).toBe(files[0]);
});

it("preserves normal-account upload and deletion", async () => {
  const drop = renderHook(() => useSandboxFileDrop(dropOptions), { wrapper });
  act(() => drop.result.current.handleFilesDropped(files));
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  const deletion = renderHook(() => useDeleteSandbox(), { wrapper });
  await act(async () => deletion.result.current.deleteSandbox());
  expect(fetchMock).toHaveBeenCalledTimes(2);
});
