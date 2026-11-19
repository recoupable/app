// @vitest-environment jsdom
import { useLayoutEffect } from "react";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useReleaseCaseRequest } from "../useReleaseCaseRequest";
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it("uses the current token reader for a request started during the new layout phase", async () => {
  const fetcher = vi.fn(async () => Response.json({ cases: [] }));
  vi.stubGlobal("fetch", fetcher);
  const generation = () => 0;
  const first = async () => "old-token";
  const second = async () => "new-token";
  const { rerender } = renderHook(
    ({ token }) => {
      const request = useReleaseCaseRequest(null, token, generation);
      useLayoutEffect(() => {
        void request({ action: "list_release_cases" }, 0);
      }, [token, request]);
    },
    { initialProps: { token: first } },
  );
  await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
  rerender({ token: second });
  await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));
  expect(
    (fetcher.mock.calls as unknown as [string, RequestInit][])[1][1].headers,
  ).toMatchObject({ Authorization: "Bearer new-token" });
});
