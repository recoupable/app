import { beforeEach, describe, expect, it, vi } from "vitest";
import { NEW_API_BASE_URL } from "../consts";
import { fetchOrCreateAccount } from "../accounts/fetchOrCreateAccount";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("fetchOrCreateAccount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls the dedicated accounts endpoint with bearer auth when available", async () => {
    const account = { account_id: "account-123", email: "user@example.com" };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: account }),
    });

    const result = await fetchOrCreateAccount({
      email: "user@example.com",
      wallet: "0x123",
      accessToken: "test-token",
    });

    expect(mockFetch).toHaveBeenCalledWith(
      `${NEW_API_BASE_URL}/api/accounts`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({
          email: "user@example.com",
          wallet: "0x123",
        }),
      },
    );
    expect(result).toEqual(account);
  });

  it("omits the authorization header when no token is available", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { account_id: "account-123" } }),
    });

    await fetchOrCreateAccount({
      email: "user@example.com",
      wallet: "0x123",
      accessToken: null,
    });

    expect(mockFetch).toHaveBeenCalledWith(
      `${NEW_API_BASE_URL}/api/accounts`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "user@example.com",
          wallet: "0x123",
        }),
      },
    );
  });

  it("throws when the dedicated API returns a non-OK response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
    });

    await expect(
      fetchOrCreateAccount({
        email: "user@example.com",
      }),
    ).rejects.toThrow("Account API request failed with status: 400");
  });
});
