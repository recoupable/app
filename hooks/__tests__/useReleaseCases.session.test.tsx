// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useReleaseCases } from "../useReleaseCases";
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it("hides prior actor state and ignores a pending read across a same-workspace session switch", async () => {
  let finish!: (value: Response) => void;
  const token = async () => "synthetic";
  const fetcher = vi.fn(async (_url, init) => {
    if (JSON.parse(init.body).action === "read_release_case")
      return new Promise<Response>((resolve) => {
        finish = resolve;
      });
    return Response.json({
      cases: [{ request_id: "private-case" }],
      next_id: null,
    });
  });
  vi.stubGlobal("fetch", fetcher);
  const { result, rerender } = renderHook(
    ({ sessionKey }) =>
      useReleaseCases({
        accountId: "same-account",
        organizationId: "same-org",
        getAccessToken: token,
        sessionKey,
      }),
    { initialProps: { sessionKey: "actor-a" } },
  );
  await waitFor(() => expect(result.current.loaded).toBe(true));
  let pending!: Promise<void>;
  act(() => {
    pending = result.current.open("private-case");
  });
  await waitFor(() => expect(finish).toBeTypeOf("function"));
  rerender({ sessionKey: "actor-b" });
  expect(result.current.items).toEqual([]);
  expect(result.current.current).toBeNull();
  await act(async () => {
    finish(
      Response.json({
        request_id: "private-case",
        summary: "Old actor secret",
      }),
    );
    await pending;
  });
  expect(result.current.current).toBeNull();
});
