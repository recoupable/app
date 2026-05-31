import { describe, it, expect, vi, beforeEach } from "vitest";
import getConversations from "../getConversations";
import { NEW_API_BASE_URL } from "../consts";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("getConversations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("successful responses", () => {
    it("fetches conversations from NEW_API_BASE_URL and projects the wire shape", async () => {
      const apiChats = [
        {
          id: "chat-1",
          title: "Test Chat",
          accountId: "account-123",
          sessionId: "session-789",
          artistId: "artist-456",
          updatedAt: "2024-01-01T00:00:00Z",
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: "success", chats: apiChats }),
      });

      const result = await getConversations("test-token");

      // Verify account_id is NOT passed as query param (per API docs for personal tokens)
      expect(mockFetch).toHaveBeenCalledWith(
        `${NEW_API_BASE_URL}/api/chats`,
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          }),
        }),
      );
      expect(result).toEqual([
        {
          id: "chat-1",
          topic: "Test Chat",
          sessionId: "session-789",
          account_id: "account-123",
          artist_id: "artist-456",
          updated_at: "2024-01-01T00:00:00Z",
        },
      ]);
    });

    it("passes ?artist_account_id when artistAccountId is supplied", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: "success", chats: [] }),
      });

      await getConversations("test-token", "artist-456");

      expect(mockFetch).toHaveBeenCalledWith(
        `${NEW_API_BASE_URL}/api/chats?artist_account_id=artist-456`,
        expect.any(Object),
      );
    });

    it("omits artist_account_id when artistAccountId is undefined", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: "success", chats: [] }),
      });

      await getConversations("test-token");

      expect(mockFetch).toHaveBeenCalledWith(
        `${NEW_API_BASE_URL}/api/chats`,
        expect.any(Object),
      );
    });

    it("maps null artistId to undefined on the projected Conversation", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: "success",
          chats: [
            {
              id: "chat-2",
              title: "No artist",
              accountId: "account-123",
              sessionId: "session-790",
              artistId: null,
              updatedAt: "2024-01-02T00:00:00Z",
            },
          ],
        }),
      });

      const result = await getConversations("test-token");

      expect(result[0].artist_id).toBeUndefined();
    });

    it("returns empty array when chats is undefined in response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: "success" }),
      });

      const result = await getConversations("test-token");

      expect(result).toEqual([]);
    });

    it("returns empty array when chats is null in response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: "success", chats: null }),
      });

      const result = await getConversations("test-token");

      expect(result).toEqual([]);
    });
  });

  describe("error handling", () => {
    it("returns empty array when accessToken is empty", async () => {
      const result = await getConversations("");

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it("returns empty array when response is not ok", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => "Unauthorized",
      });

      const result = await getConversations("test-token");

      expect(result).toEqual([]);
    });

    it("returns empty array when fetch throws an error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await getConversations("test-token");

      expect(result).toEqual([]);
    });
  });

  describe("authentication", () => {
    it("uses Bearer token in Authorization header", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: "success", chats: [] }),
      });

      await getConversations("my-privy-token");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer my-privy-token",
          }),
        }),
      );
    });
  });
});
