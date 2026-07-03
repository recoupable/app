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
