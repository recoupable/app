import { afterEach, expect, it, vi } from "vitest";
import { getReleaseStreamCatalogs } from "../getReleaseStreamCatalogs";
afterEach(() => vi.unstubAllGlobals());
it("keeps personal and organization catalogs in their exact workspace, excluding unattributed owners", async () => {
  const fetcher = vi.fn<(url: string) => Promise<Response>>(async () =>
    Response.json({
      catalogs: [
        { id: "personal", name: "Personal", owner: { id: "actor" } },
        { id: "org", name: "Organization", owner: { id: "org" } },
        { id: "unknown", name: "Unknown" },
      ],
    }),
  );
  vi.stubGlobal("fetch", fetcher);
  const signal = new AbortController().signal;
  expect(
    await getReleaseStreamCatalogs("actor", async () => "token", signal),
  ).toEqual([{ id: "personal", name: "Personal", owner: { id: "actor" } }]);
  expect(
    await getReleaseStreamCatalogs("actor", async () => "token", signal, "org"),
  ).toEqual([{ id: "org", name: "Organization", owner: { id: "org" } }]);
  expect(fetcher.mock.calls.map(([url]) => new URL(url).pathname)).toEqual([
    "/api/accounts/actor/catalogs",
    "/api/accounts/actor/catalogs",
  ]);
});
it("does not fetch anonymously or expose raw access errors", async () => {
  const fetcher = vi.fn(
    async () => new Response("private internals", { status: 403 }),
  );
  vi.stubGlobal("fetch", fetcher);
  await expect(
    getReleaseStreamCatalogs(
      "actor",
      async () => null,
      new AbortController().signal,
    ),
  ).rejects.toThrow("sign in");
  expect(fetcher).not.toHaveBeenCalled();
  await expect(
    getReleaseStreamCatalogs(
      "actor",
      async () => "token",
      new AbortController().signal,
    ),
  ).rejects.toThrow("unavailable in this workspace");
});
