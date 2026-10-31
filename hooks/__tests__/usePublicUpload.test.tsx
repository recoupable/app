// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  state,
  resetState,
  deferred,
  imageFile,
  receipt,
} from "./publicUpload.fixture";
import { usePublicUpload } from "../usePublicUpload";
const fetchMock = vi.fn();
beforeEach(() => {
  resetState();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.resetAllMocks();
});

it("blocks delayed token acquisition after account logout and same-actor relogin", async () => {
  const token = deferred<string>();
  state.auth.getAccessToken.mockReturnValue(token.promise);
  const { result, rerender } = renderHook(() => usePublicUpload("profile"));
  let operation!: ReturnType<typeof result.current.begin>;
  act(() => {
    operation = result.current.begin();
  });
  const pending = operation.upload(imageFile());
  const assertion = expect(pending).rejects.toThrow("context changed");
  state.auth.authenticated = false;
  rerender();
  state.auth.authenticated = true;
  rerender();
  token.resolve("old-token");
  await assertion;
  expect(fetchMock).not.toHaveBeenCalled();
});

it.each(["target", "actor", "origin", "unmount"])(
  "retires an in-flight write when %s changes",
  async (change) => {
    const response = deferred<Response>();
    fetchMock.mockReturnValue(response.promise);
    const { result, rerender, unmount } = renderHook(
      ({ target }) => usePublicUpload(target),
      { initialProps: { target: "artist-a" } },
    );
    let operation!: ReturnType<typeof result.current.begin>;
    act(() => {
      operation = result.current.begin();
    });
    const pending = operation.upload(imageFile());
    const assertion = expect(pending).rejects.toThrow("context changed");
    await act(async () => {
      await Promise.resolve();
    });
    const signal = fetchMock.mock.calls[0][1].signal as AbortSignal;
    if (change === "target") rerender({ target: "artist-b" });
    if (change === "actor") {
      state.auth.user.id = "actor-b";
      rerender({ target: "artist-a" });
    }
    if (change === "origin") {
      state.origin = "https://other.example";
      rerender({ target: "artist-a" });
    }
    if (change === "unmount") unmount();
    expect(signal.aborted).toBe(true);
    response.resolve(receipt());
    await assertion;
    operation.reportError(new Error("stale"));
    expect(state.error).not.toHaveBeenCalled();
  },
);

it("detects an origin change even before a rerender", async () => {
  const token = deferred<string>();
  state.auth.getAccessToken.mockReturnValue(token.promise);
  const { result } = renderHook(() => usePublicUpload("profile"));
  let operation!: ReturnType<typeof result.current.begin>;
  act(() => {
    operation = result.current.begin();
  });
  const pending = operation.upload(imageFile());
  const assertion = expect(pending).rejects.toThrow("context changed");
  state.origin = "https://other.example";
  token.resolve("token");
  await assertion;
  expect(fetchMock).not.toHaveBeenCalled();
});

it("missing-token failures leave the network untouched and become actionable errors", async () => {
  state.auth.getAccessToken.mockResolvedValue(null);
  const { result } = renderHook(() => usePublicUpload("profile"));
  let operation!: ReturnType<typeof result.current.begin>;
  act(() => {
    operation = result.current.begin();
  });
  await expect(operation.upload(imageFile())).rejects.toThrow("sign in");
  expect(fetchMock).not.toHaveBeenCalled();
});
