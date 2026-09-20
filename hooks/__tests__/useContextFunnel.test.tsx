// @vitest-environment jsdom
import { act, renderHook, waitFor, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useContextFunnel } from "../useContextFunnel";
const login = vi.fn();
const token = vi.fn().mockResolvedValue("account-token");
const guest = {
  id: "guest",
  status: "ready",
  input: { url: "https://open.spotify.com/track/test" },
  context: { title: "Song" },
};
beforeEach(() => {
  sessionStorage.clear();
  vi.clearAllMocks();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it("claims after account readiness without restarting extraction", async () => {
  const fetcher = vi.fn().mockImplementation(async (path) => {
    if (path.endsWith("/claim")) return Response.json({ requestId: "request" });
    if (path === "/api/context")
      return Response.json({ request: { id: "request", status: "partial" } });
    return Response.json(guest);
  });
  vi.stubGlobal("fetch", fetcher);
  const { result, rerender } = renderHook(
    ({ accountId }) =>
      useContextFunnel({ accountId, getAccessToken: token, login }),
    { initialProps: { accountId: null as string | null } },
  );
  await act(() => result.current.start("https://open.spotify.com/track/test"));
  act(() => result.current.save());
  expect(login).toHaveBeenCalledOnce();
  expect(fetcher.mock.calls.some(([p]) => p.endsWith("/claim"))).toBe(false);
  rerender({ accountId: "account" });
  await waitFor(() => expect(result.current.requestId).toBe("request"));
  const claims = fetcher.mock.calls.filter(([p]) => p.endsWith("/claim"));
  expect(claims).toHaveLength(1);
  expect(claims[0][1].headers.Authorization).toBe("Bearer account-token");
  expect(
    fetcher.mock.calls.filter(
      ([, i]) => i?.body && JSON.parse(i.body).action === "start",
    ),
  ).toHaveLength(1);
  expect(sessionStorage.getItem("context:claim")).toBeNull();
});
it("recovers pending claim after redirect and keeps intent on failure", async () => {
  sessionStorage.setItem("context:claim", "1");
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockImplementation(async () =>
        Response.json({ error: "Please retry" }, { status: 503 }),
      ),
  );
  const { result } = renderHook(() =>
    useContextFunnel({ accountId: "account", getAccessToken: token, login }),
  );
  await waitFor(() => expect(result.current.error).toBe("Please retry"));
  expect(sessionStorage.getItem("context:claim")).toBe("1");
});
it("signed-in starts use authenticated ingestion", async () => {
  const fetcher = vi
    .fn()
    .mockImplementation(async () =>
      Response.json({ request: { id: "request", status: "partial" } }),
    );
  vi.stubGlobal("fetch", fetcher);
  const { result } = renderHook(() =>
    useContextFunnel({ accountId: "account", getAccessToken: token, login }),
  );
  await act(() => result.current.start("https://open.spotify.com/track/test"));
  expect(fetcher.mock.calls[0][0]).toBe("/api/context");
  expect(JSON.parse(fetcher.mock.calls[0][1].body).action).toBe("ingest");
});
it("retries a claimed job through its claim receipt, not a new ingest", async () => {
  sessionStorage.setItem("context:request:account", "request");
  sessionStorage.setItem("context:claimed:account:request", "1");
  const fetcher = vi
    .fn()
    .mockImplementation(async (path) =>
      path.endsWith("/claim")
        ? Response.json({ requestId: "request" })
        : Response.json({
            request: {
              id: "request",
              status: "failed",
              input: { url: "https://open.spotify.com/track/test" },
            },
          }),
    );
  vi.stubGlobal("fetch", fetcher);
  const { result } = renderHook(() =>
    useContextFunnel({ accountId: "account", getAccessToken: token, login }),
  );
  await waitFor(() => expect(result.current.snapshot?.status).toBe("failed"));
  act(() => result.current.refresh());
  await waitFor(() =>
    expect(fetcher.mock.calls.some(([p]) => p.endsWith("/claim"))).toBe(true),
  );
  expect(
    fetcher.mock.calls.some(
      ([, i]) => i?.body && JSON.parse(i.body).action === "ingest",
    ),
  ).toBe(false);
});
