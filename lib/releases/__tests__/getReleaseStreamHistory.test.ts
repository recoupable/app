import { afterEach, expect, it, vi } from "vitest";
import { getReleaseStreamHistory } from "../getReleaseStreamHistory";
const period = { since: "2026-10-02", days: 7 };
const page = (index: number, count = 26) => ({
  catalog_id: "catalog",
  provider: "luminate",
  platform: "all_dsps",
  territory: "worldwide",
  metric: "daily_streams",
  periods: {
    previous: { start: "2026-09-25", end_exclusive: "2026-10-02" },
    current: { start: "2026-10-02", end_exclusive: "2026-10-09" },
    days: 7,
    timezone: "UTC",
  },
  pagination: {
    page: index,
    total_count: count,
    has_more: index === 1 && count > 25,
  },
  recordings: Array.from(
    { length: index === 1 ? Math.min(count, 25) : count - 25 },
    (_, i) => ({
      isrc: `recording-${(index - 1) * 25 + i}`,
      state: "incomplete",
      provider_recording_id: null,
      retrieved_at: null,
      days: [],
    }),
  ),
});
afterEach(() => vi.unstubAllGlobals());
it("loads beyond the first page using the existing viewer token without starting collection", async () => {
  const fetcher = vi.fn(async (url: string) =>
    Response.json(page(Number(new URL(url).searchParams.get("page")))),
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
  expect(fetcher.mock.calls[0][0]).toContain("/streams?");
});
it("rejects changing pagination rather than presenting partial totals", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) =>
      Response.json(
        page(
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
    vi.fn(async () => Response.json({ ...page(1), platform: "spotify" })),
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
    vi.fn(async () => Response.json(page(1, 251))),
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
