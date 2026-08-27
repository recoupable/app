import { afterEach, describe, expect, it, vi } from "vitest";
import getAccountUsage from "@/lib/recoup/getAccountUsage";

vi.mock("@/lib/api/getClientApiBaseUrl", () => ({
  getClientApiBaseUrl: () => "https://api.test",
}));

const ACCOUNT = "123e4567-e89b-12d3-a456-426614174000";
const PAGE = {
  account_id: ACCOUNT,
  period: { from: "2026-08-01T00:00:00.000Z", to: "2026-08-27T12:00:00.000Z" },
  total_credits_deducted: 20000,
  total_usd: "$0.02",
  events: [],
  next_cursor: null,
};

describe("getAccountUsage", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("calls GET /api/accounts/{id}/usage with the bearer, limit and cursor", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, status: 200, json: async () => PAGE });
    vi.stubGlobal("fetch", fetchMock);

    const page = await getAccountUsage(ACCOUNT, "tok", {
      limit: 20,
      cursor: "2026-08-27T11:00:00.000Z",
    });

    expect(page).toEqual(PAGE);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(
      `https://api.test/api/accounts/${ACCOUNT}/usage?limit=20&cursor=2026-08-27T11%3A00%3A00.000Z`,
    );
    expect(init.headers).toEqual({ Authorization: "Bearer tok" });
  });

  it("omits the cursor on the first page", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, status: 200, json: async () => PAGE });
    vi.stubGlobal("fetch", fetchMock);

    await getAccountUsage(ACCOUNT, "tok", { limit: 20 });

    expect(fetchMock.mock.calls[0][0]).toBe(
      `https://api.test/api/accounts/${ACCOUNT}/usage?limit=20`,
    );
  });

  it("throws an error carrying the status so a 403 can render as no-access", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue({ ok: false, status: 403, json: async () => ({}) }),
    );

    await expect(
      getAccountUsage(ACCOUNT, "tok", { limit: 20 }),
    ).rejects.toMatchObject({ status: 403 });
  });

  it("sends the sort when one is given", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, status: 200, json: async () => PAGE });
    vi.stubGlobal("fetch", fetchMock);
    await getAccountUsage(ACCOUNT, "tok", { limit: 20, sort: "cost" });
    expect(fetchMock.mock.calls[0][0]).toBe(
      `https://api.test/api/accounts/${ACCOUNT}/usage?limit=20&sort=cost`,
    );
  });
});
