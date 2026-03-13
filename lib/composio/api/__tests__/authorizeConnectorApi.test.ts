import { describe, it, expect, vi, beforeEach } from "vitest";
import { authorizeConnectorApi } from "../authorizeConnectorApi";
import { NEW_API_BASE_URL } from "@/lib/consts";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("authorizeConnectorApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("successful responses", () => {
    it("sends connector in request body and returns redirectUrl", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { connector: "tiktok", redirectUrl: "https://oauth.example.com" },
        }),
      });

      const result = await authorizeConnectorApi("test-token", {
        connector: "tiktok",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        `${NEW_API_BASE_URL}/api/connectors`,
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          },
          body: JSON.stringify({ connector: "tiktok" }),
        }),
      );
      expect(result).toBe("https://oauth.example.com");
    });

    it("includes account_id and callback_url when provided", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { connector: "tiktok", redirectUrl: "https://oauth.example.com" },
        }),
      });

      await authorizeConnectorApi("test-token", {
        connector: "tiktok",
        accountId: "artist-456",
        callbackUrl: "https://chat.recoupable.com/?artist_connected=true",
      });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.connector).toBe("tiktok");
      expect(body.account_id).toBe("artist-456");
      expect(body.callback_url).toBe("https://chat.recoupable.com/?artist_connected=true");
    });

    it("omits account_id and callback_url when not provided", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { connector: "googlesheets", redirectUrl: "https://oauth.example.com" },
        }),
      });

      await authorizeConnectorApi("test-token", { connector: "googlesheets" });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body).toEqual({ connector: "googlesheets" });
      expect(body.account_id).toBeUndefined();
      expect(body.callback_url).toBeUndefined();
    });

    it("returns null when redirectUrl is missing from response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await authorizeConnectorApi("test-token", {
        connector: "tiktok",
      });

      expect(result).toBeNull();
    });
  });

  describe("error handling", () => {
    it("throws when response is not ok", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      await expect(authorizeConnectorApi("test-token", { connector: "tiktok" })).rejects.toThrow(
        "Failed to authorize connector",
      );
    });
  });
});
