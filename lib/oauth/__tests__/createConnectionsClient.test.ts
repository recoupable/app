import { afterEach, expect, it, vi } from "vitest";
import { createConnectionsClient } from "../createConnectionsClient";
afterEach(() => vi.unstubAllGlobals());
it("never sends login credentials to redirects or query-supplied destinations", async () => {
  expect(() =>
    createConnectionsClient(
      "https://api.example/api/oauth?redirect=https://evil.example",
    ),
  ).toThrow();
  const fetcher = vi
    .fn()
    .mockResolvedValue(new Response(null, { status: 204 }));
  vi.stubGlobal("fetch", fetcher);
  const client = createConnectionsClient("https://api.example/api/oauth");
  await client.revoke("private-token", "a".repeat(64));
  expect(fetcher).toHaveBeenCalledWith(
    `https://api.example/api/oauth/connections/${"a".repeat(64)}`,
    expect.objectContaining({
      method: "DELETE",
      credentials: "omit",
      redirect: "error",
      cache: "no-store",
      headers: { Authorization: "Bearer private-token" },
    }),
  );
  await expect(client.revoke("private-token", "../other")).rejects.toThrow();
  expect(fetcher).toHaveBeenCalledTimes(1);
});
