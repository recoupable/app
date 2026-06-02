import { describe, it, expect, vi, beforeEach } from "vitest";
import { getChatSnapshot } from "../getChatSnapshot";
import { NEW_API_BASE_URL } from "../../consts";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("getChatSnapshot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches the session-scoped chat with a bearer token", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ messages: [], isStreaming: false }),
    });

    await getChatSnapshot("sess-1", "chat-1", "tok-123");

    expect(mockFetch).toHaveBeenCalledWith(
      `${NEW_API_BASE_URL}/api/sessions/sess-1/chats/chat-1`,
      { headers: { Authorization: "Bearer tok-123" } },
    );
  });

  it("returns messages and isStreaming from the response", async () => {
    const messages = [{ id: "m1", role: "user", parts: [] }];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ messages, isStreaming: true }),
    });

    const result = await getChatSnapshot("sess-1", "chat-1", "tok");

    expect(result).toEqual({ messages, isStreaming: true });
  });

  it("defaults isStreaming to false when absent", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ messages: [] }),
    });

    const result = await getChatSnapshot("sess-1", "chat-1", "tok");

    expect(result).toEqual({ messages: [], isStreaming: false });
  });

  it("throws with the server's error text on a non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      text: async () => "Chat not found",
      json: async () => ({}),
    });

    await expect(getChatSnapshot("sess-1", "chat-1", "tok")).rejects.toThrow(
      "Chat not found",
    );
  });

  it("throws a generic HTTP error when the body has no text", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => "",
    });

    await expect(getChatSnapshot("sess-1", "chat-1", "tok")).rejects.toThrow(
      "HTTP 500",
    );
  });

  it("url-encodes both ids", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ messages: [], isStreaming: false }),
    });

    await getChatSnapshot("a/b", "c d", "tok");

    expect(mockFetch).toHaveBeenCalledWith(
      `${NEW_API_BASE_URL}/api/sessions/a%2Fb/chats/c%20d`,
      expect.any(Object),
    );
  });
});
