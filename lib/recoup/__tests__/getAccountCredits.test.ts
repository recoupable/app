import { describe, it, expect, vi, beforeEach } from "vitest";
import getAccountCredits from "../getAccountCredits";
import { NEW_API_BASE_URL } from "@/lib/consts";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("getAccountCredits", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches credits from the Recoup API with the Privy bearer token", async () => {
    const apiResponse = {
      account_id: "account-123",
      remaining_credits: 333,
      total_credits: 9999,
      used_credits: 9666,
      is_pro: true,
      timestamp: "2026-07-03T00:00:00Z",
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => apiResponse,
    });

    const result = await getAccountCredits("account-123", "test-token");

    expect(mockFetch).toHaveBeenCalledWith(
      `${NEW_API_BASE_URL}/api/accounts/account-123/credits`,
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-token",
        }),
      }),
    );
    expect(result).toEqual(apiResponse);
  });

  // chat#1949 F4b: `useCredits` gates its query with react-query's `enabled`,
  // but `refetch()` ignores `enabled`. `usePayment` exposes `refetchCredits`
  // and `useVercelChat` calls it, so on a cold load the request fired with
  // `account_id` still undefined and produced GET
  // /api/accounts/undefined/credits -> 400. Guard where the URL is built, so
  // no caller can interpolate a missing id again.
  it.each([
    ["undefined", undefined],
    ["the literal string 'undefined'", "undefined"],
    ["an empty string", ""],
  ])("refuses to build a request when accountId is %s", async (_label, id) => {
    await expect(
      getAccountCredits(id as unknown as string, "test-token"),
    ).rejects.toThrow(/account id/i);

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("throws on a non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: "Unauthorized" }),
    });

    await expect(getAccountCredits("account-123", "bad-token")).rejects.toThrow(
      "401",
    );
  });
});
