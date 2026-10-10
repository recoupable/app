import { afterEach, expect, it, vi } from "vitest";
import { getReleaseCatalogSongs } from "../getReleaseCatalogSongs";
const read = (
  token: string | null = "viewer",
  signal = new AbortController().signal,
) => getReleaseCatalogSongs("catalog", async () => token, signal);
const page = (number: number, count = 101) => ({
  status: "success",
  songs: Array.from(
    { length: Math.min(100, Math.max(0, count - (number - 1) * 100)) },
    (_, i) => ({
      catalog_id: "catalog",
      isrc: `USABC26${String((number - 1) * 100 + i).padStart(5, "0")}`,
      name: "Song",
      album: "Album",
    }),
  ),
  pagination: {
    page: number,
    limit: 100,
    total_count: count,
    total_pages: Math.ceil(count / 100),
  },
});
afterEach(() => vi.unstubAllGlobals());
it("reads every saved metadata page using the viewer without collecting new data", async () => {
  const fetcher = vi.fn<
    (url: string, options: RequestInit) => Promise<Response>
  >(async (url: string) =>
    Response.json(page(Number(new URL(url).searchParams.get("page")))),
  );
  vi.stubGlobal("fetch", fetcher);
  expect(await read()).toHaveLength(101);
  expect(fetcher).toHaveBeenCalledTimes(2);
  expect(fetcher.mock.calls[0][0]).toContain("catalog_id=catalog");
  expect(fetcher.mock.calls[0][1]).toMatchObject({
    method: "GET",
    headers: { Authorization: "Bearer viewer" },
  });
});
it.each(["count", "duplicate", "cap", "scope"])(
  "rejects incomplete catalog metadata: %s",
  async (mode) => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        const number = Number(new URL(url).searchParams.get("page"));
        const result = page(
          number,
          mode === "cap" ? 251 : mode === "count" && number === 2 ? 102 : 101,
        );
        if (mode === "scope") result.songs[0].catalog_id = "other";
        if (mode === "duplicate" && number === 2)
          result.songs[0].isrc = page(1).songs[0].isrc;
        return Response.json(result);
      }),
    );
    await expect(read()).rejects.toThrow();
  },
);
it("does not fetch when signed out or cancelled", async () => {
  const fetcher = vi.fn();
  vi.stubGlobal("fetch", fetcher);
  await expect(read(null)).rejects.toThrow("sign in");
  const controller = new AbortController();
  controller.abort();
  await expect(read("viewer", controller.signal)).rejects.toThrow();
  expect(fetcher).not.toHaveBeenCalled();
});
