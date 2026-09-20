import { afterEach, expect, it, vi } from "vitest";
import { proxyContextRequest } from "../proxyContextRequest";
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
it("forwards only the guest capability, origin and account authorization", async () => {
  vi.stubEnv("CONTEXT_API_URL", "https://api.example.test");
  const fetcher = vi
    .fn()
    .mockResolvedValue(
      new Response("{}", {
        headers: {
          "set-cookie":
            "recoup_context_guest=abc; HttpOnly; Path=/api/context/guest; SameSite=Lax",
        },
      }),
    );
  vi.stubGlobal("fetch", fetcher);
  const response = await proxyContextRequest(
    new Request("https://chat.example.test/api/context/guest", {
      method: "POST",
      headers: {
        origin: "https://chat.example.test",
        cookie: "privy=private; recoup_context_guest=abc; other=private",
        authorization: "Bearer verified",
      },
      body: "{}",
    }),
    "/guest",
  );
  const [url, init] = fetcher.mock.calls[0];
  expect(url).toBe("https://api.example.test/api/context/guest");
  expect(init.headers.get("cookie")).toBe("recoup_context_guest=abc");
  expect(init.headers.get("authorization")).toBe("Bearer verified");
  expect(init.headers.get("origin")).toBe("https://chat.example.test");
  expect(init.headers.has("x-api-key")).toBe(false);
  expect(response.headers.get("set-cookie")).toContain("HttpOnly");
  expect(response.headers.get("cache-control")).toContain("no-store");
});
it("rejects foreign origins before forwarding", async () => {
  const fetcher = vi.fn();
  vi.stubGlobal("fetch", fetcher);
  const r = await proxyContextRequest(
    new Request("https://chat.example.test/api/context/guest", {
      method: "POST",
      headers: { origin: "https://evil.test" },
      body: "{}",
    }),
    "/guest",
  );
  expect(r.status).toBe(403);
  expect(fetcher).not.toHaveBeenCalled();
});
it("preserves retry status and does not leak unrelated upstream cookies", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        new Response("{}", {
          status: 409,
          headers: { "set-cookie": "unrelated=private" },
        }),
      ),
  );
  const r = await proxyContextRequest(
    new Request("https://chat.example.test/api/context/guest"),
    "/guest",
  );
  expect(r.status).toBe(409);
  expect(r.headers.has("set-cookie")).toBe(false);
});
