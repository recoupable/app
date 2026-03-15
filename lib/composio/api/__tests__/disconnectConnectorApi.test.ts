import { describe, it, expect, vi, beforeEach } from "vitest";
import { disconnectConnectorApi } from "../disconnectConnectorApi";
import { NEW_API_BASE_URL } from "@/lib/consts";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("disconnectConnectorApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("successful responses", () => {
    it("sends connected_account_id in DELETE request", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: "Connector disconnected" }),
      });

      const result = await disconnectConnectorApi("test-token", "conn-abc");

      expect(mockFetch).toHaveBeenCalledWith(
        `${NEW_API_BASE_URL}/api/connectors`,
        expect.objectContaining({
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          },
          body: JSON.stringify({ connected_account_id: "conn-abc" }),
        }),
      );
      expect(result).toBe(true);
    });

    it("includes account_id when provided", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await disconnectConnectorApi("test-token", "conn-abc", "artist-456");

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.connected_account_id).toBe("conn-abc");
      expect(body.account_id).toBe("artist-456");
    });

    it("omits account_id when not provided", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await disconnectConnectorApi("test-token", "conn-abc");

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body).toEqual({ connected_account_id: "conn-abc" });
      expect(body.account_id).toBeUndefined();
    });
  });

  describe("error handling", () => {
    it("throws when response is not ok", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
      });

      await expect(disconnectConnectorApi("test-token", "conn-abc")).rejects.toThrow(
        "Failed to disconnect connector",
      );
    });

    it("throws when fetch fails", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(disconnectConnectorApi("test-token", "conn-abc")).rejects.toThrow(
        "Network error",
      );
    });
  });
});
