import { describe, it, expect, vi, beforeEach } from "vitest";
import updateAutoRechargeSetting from "../updateAutoRechargeSetting";
import { NEW_API_BASE_URL } from "@/lib/consts";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("updateAutoRechargeSetting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("PATCHes the auto top-up setting with the Privy bearer token", async () => {
    const apiResponse = { account_id: "account-123", enabled: false };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => apiResponse,
    });

    const result = await updateAutoRechargeSetting(
      "account-123",
      "test-token",
      false,
    );

    expect(mockFetch).toHaveBeenCalledWith(
      `${NEW_API_BASE_URL}/api/accounts/account-123/auto-recharge`,
      expect.objectContaining({
        method: "PATCH",
        headers: expect.objectContaining({
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ enabled: false }),
      }),
    );
    expect(result).toEqual(apiResponse);
  });

  it("throws on a non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ error: "Forbidden" }),
    });

    await expect(
      updateAutoRechargeSetting("account-123", "bad-token", true),
    ).rejects.toThrow("403");
  });
});
