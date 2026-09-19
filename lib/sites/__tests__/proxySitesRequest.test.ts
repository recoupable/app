import { afterEach, expect, it, vi } from "vitest";
import { proxySitesRequest } from "../proxySitesRequest";
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
it("forwards auth and JSON without sharing cookies or adding service credentials", async () => {
  vi.stubEnv("SITES_API_URL", "https://api.example.test");
  const fetcher = vi
    .fn()
    .mockResolvedValue(Response.json({ site: { id: "one" } }));
  vi.stubGlobal("fetch", fetcher);
  const response = await proxySitesRequest(
    new Request("http://localhost/api/sites", {
      method: "POST",
      headers: {
        authorization: "Bearer account-token",
        "content-type": "application/json",
        cookie: "private",
      },
      body: '{"name":"x"}',
    }),
    "",
  );
  expect(response.status).toBe(200);
  const [url, init] = fetcher.mock.calls[0];
  expect(url).toBe("https://api.example.test/api/sites");
  expect(init.headers.get("authorization")).toBe("Bearer account-token");
  expect(init.headers.has("cookie")).toBe(false);
  expect(init.headers.has("x-api-key")).toBe(false);
});
it("preserves backend conflict status", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(Response.json({ error: "Reload" }, { status: 409 })),
  );
  expect(
    (await proxySitesRequest(new Request("http://localhost/api/sites"), "/id"))
      .status,
  ).toBe(409);
});
