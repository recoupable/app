import { afterEach, expect, it, vi } from "vitest";
import { requestStreamData } from "../requestStreamData";
vi.mock("@/lib/api/getClientApiBaseUrl", () => ({
  getClientApiBaseUrl: () => "https://preview-api.example",
}));
afterEach(() => vi.unstubAllGlobals());
it("uses the configured API for both saved reads and explicit tracking writes", async () => {
  const fetcher = vi.fn(async (_url: string) =>
    Response.json({ status: "success" }),
  );
  vi.stubGlobal("fetch", fetcher);
  const signal = new AbortController().signal;
  await requestStreamData(
    "catalogs/example/streams",
    async () => "viewer",
    signal,
  );
  await requestStreamData(
    "catalogs/example/stream-tracking",
    async () => "viewer",
    signal,
    { action: "enable" },
  );
  expect(fetcher.mock.calls.map((call) => call[0])).toEqual([
    "https://preview-api.example/api/catalogs/example/streams",
    "https://preview-api.example/api/catalogs/example/stream-tracking",
  ]);
});
