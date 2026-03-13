import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchConnectorsApi } from "../fetchConnectorsApi";
import { NEW_API_BASE_URL } from "@/lib/consts";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("fetchConnectorsApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("successful responses", () => {
    it("fetches connectors without account_id when none provided", async () => {
      const mockConnectors = [
        {
          slug: "googlesheets",
          name: "Google Sheets",
          isConnected: true,
          connectedAccountId: "abc",
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, connectors: mockConnectors }),
      });

      const result = await fetchConnectorsApi("test-token");

      expect(mockFetch).toHaveBeenCalledWith(
        `${NEW_API_BASE_URL}/api/connectors`,
        expect.objectContaining({
          headers: { Authorization: "Bearer test-token" },
        }),
      );
      expect(result).toEqual(mockConnectors);
    });

    it("includes account_id query param when provided", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, connectors: [] }),
      });

      await fetchConnectorsApi("test-token", "artist-123");

      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain("account_id=artist-123");
    });

    it("returns empty array when connectors is undefined", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await fetchConnectorsApi("test-token");

      expect(result).toEqual([]);
    });
  });

  describe("error handling", () => {
    it("throws when response is not ok", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      await expect(fetchConnectorsApi("test-token")).rejects.toThrow("Failed to fetch connectors");
    });

    it("throws when fetch fails", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(fetchConnectorsApi("test-token")).rejects.toThrow("Network error");
    });
  });
});
