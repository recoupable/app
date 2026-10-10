import { afterEach, expect, it, vi } from "vitest";
import { getReleaseStreamHistory } from "../getReleaseStreamHistory";
import { period, createPage } from "./streamHistoryFixture";
afterEach(() => vi.unstubAllGlobals());
it("loads beyond the first page using the existing viewer token without starting collection", async () => {
  const fetcher = vi.fn<
    (url: string, options: RequestInit) => Promise<Response>
  >(async (url) =>
    Response.json(createPage(Number(new URL(url).searchParams.get("page")))),
  );
  vi.stubGlobal("fetch", fetcher);
  const data = await getReleaseStreamHistory(
    "catalog",
    period,
    async () => "viewer",
    new AbortController().signal,
  );
  expect(data.recordings).toHaveLength(26);
  expect(fetcher).toHaveBeenCalledTimes(2);
  expect(fetcher.mock.calls[0][1]).toMatchObject({
    method: "GET",
    headers: { Authorization: "Bearer viewer" },
  });
  expect(fetcher.mock.calls[0][0]).toContain("/streams?");
});
it("rejects changing pagination rather than presenting partial totals", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) =>
      Response.json(
        createPage(
          Number(new URL(url).searchParams.get("page")),
          url.includes("page=2") ? 27 : 26,
        ),
      ),
    ),
  );
  await expect(
    getReleaseStreamHistory(
      "catalog",
      period,
      async () => "viewer",
      new AbortController().signal,
    ),
  ).rejects.toThrow("Catalog changed");
});
it("rejects another provider scope and catalogs above the tracking cap", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) =>
      Response.json({
        ...createPage(Number(new URL(url).searchParams.get("page"))),
        platform: "spotify",
      }),
    ),
  );
  await expect(
    getReleaseStreamHistory(
      "catalog",
      period,
      async () => "viewer",
      new AbortController().signal,
    ),
  ).rejects.toThrow();
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => Response.json(createPage(1, 251))),
  );
  await expect(
    getReleaseStreamHistory(
      "catalog",
      period,
      async () => "viewer",
      new AbortController().signal,
    ),
  ).rejects.toThrow("250 recordings");
});
it("does not send a stale token after cancellation", async () => {
  const controller = new AbortController();
  const fetcher = vi.fn();
  vi.stubGlobal("fetch", fetcher);
  await expect(
    getReleaseStreamHistory(
      "catalog",
      period,
      async () => {
        controller.abort();
        return "viewer";
      },
      controller.signal,
    ),
  ).rejects.toThrow();
  expect(fetcher).not.toHaveBeenCalled();
});
