import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchAccountEmails } from "../fetchAccountEmails";

vi.mock("@/lib/api/getClientApiBaseUrl", () => ({
  getClientApiBaseUrl: vi.fn(() => "https://test-recoup-api.vercel.app"),
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("fetchAccountEmails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns early when no account IDs are provided", async () => {
    const result = await fetchAccountEmails({
      accessToken: "token",
      accountIds: [],
    });

    expect(result).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("builds repeated account_id params and sends bearer auth", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue([
        {
          id: "email-1",
          account_id: "acc-1",
          email: "owner@example.com",
          updated_at: "2026-04-08T00:00:00.000Z",
        },
      ]),
    });

    const result = await fetchAccountEmails({
      accessToken: "token-123",
      accountIds: ["acc-1", "acc-2"],
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "https://test-recoup-api.vercel.app/api/accounts/emails?account_id=acc-1&account_id=acc-2",
      {
        method: "GET",
        headers: {
          Authorization: "Bearer token-123",
        },
      },
    );
    expect(result[0]?.email).toBe("owner@example.com");
  });

  it("throws the API error message when the request fails", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({ error: "Unauthorized" }),
    });

    await expect(
      fetchAccountEmails({
        accessToken: "token",
        accountIds: ["acc-1"],
      }),
    ).rejects.toThrow("Unauthorized");
  });
});
