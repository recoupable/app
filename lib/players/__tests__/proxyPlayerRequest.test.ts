import { afterEach, expect, it, vi } from "vitest";
import { proxyPlayerRequest } from "../proxyPlayerRequest";
vi.mock("@/lib/sites/getSitesApiUrl", () => ({
  getSitesApiUrl: () => "https://api.example",
}));
afterEach(() => vi.unstubAllGlobals());
function request(origin = "https://app.recoupable.dev") {
  return new Request("https://app.recoupable.dev/api/players/events", {
    method: "POST",
    headers: {
      origin,
      "Content-Type": "application/json",
      Authorization: "must-not-forward",
    },
    body: JSON.stringify({ flow: "signed", event: "paused" }),
  });
}
it("rejects a cross-origin request before accessing the API", async () => {
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  expect(
    (await proxyPlayerRequest(request("https://artist.example"), "events"))
      .status,
  ).toBe(403);
  expect(fetch).not.toHaveBeenCalled();
});
it("forwards the body and trusted origin without caller credentials", async () => {
  const fetch = vi
    .fn()
    .mockResolvedValue(Response.json({ accepted: true }, { status: 202 }));
  vi.stubGlobal("fetch", fetch);
  const response = await proxyPlayerRequest(request(), "events");
  expect(fetch).toHaveBeenCalledWith(
    "https://api.example/api/players/events",
    expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ flow: "signed", event: "paused" }),
      headers: {
        "Content-Type": "application/json",
        Origin: "https://app.recoupable.dev",
      },
      redirect: "error",
      cache: "no-store",
      signal: expect.any(AbortSignal),
    }),
  );
  expect(response.status).toBe(202);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect(await response.json()).toEqual({ accepted: true });
});
it.each([
  new TypeError("network"),
  new DOMException("timeout", "TimeoutError"),
])("redacts upstream failures", async (error) => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(error));
  const response = await proxyPlayerRequest(request(), "spotify/session");
  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({
    error: "Player service unavailable",
  });
});
