import { describe, it, expect, vi, beforeEach } from "vitest";
import getAutoRechargeSetting from "../getAutoRechargeSetting";
import { NEW_API_BASE_URL } from "@/lib/consts";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("getAutoRechargeSetting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches the auto top-up setting with the Privy bearer token", async () => {
    const apiResponse = { account_id: "account-123", enabled: false };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => apiResponse,
    });

    const result = await getAutoRechargeSetting("account-123", "test-token");

    expect(mockFetch).toHaveBeenCalledWith(
      `${NEW_API_BASE_URL}/api/accounts/account-123/auto-recharge`,
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

    await expect(
      getAutoRechargeSetting("account-123", "bad-token"),
    ).rejects.toThrow("401");
  });
});
