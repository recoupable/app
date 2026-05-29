import { describe, it, expect, vi, beforeEach } from "vitest";
import { getChat } from "../getChat";

const mockFetch = vi.fn();
global.fetch = mockFetch;

const chat = {
  id: "room-1",
  sessionId: "sess-1",
  title: "Hello",
  modelId: null,
  activeStreamId: null,
  lastAssistantMessageAt: null,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

describe("getChat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the chat (incl. sessionId) on success", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ chat }) });

    const result = await getChat("room-1", "tok");

    expect(result).toEqual(chat);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/chats/room-1"),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer tok" }),
      }),
    );
  });

  it("returns null on 404 (not found)", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });
    expect(await getChat("room-1", "tok")).toBeNull();
  });

  it("returns null on 403 (no access)", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 403 });
    expect(await getChat("room-1", "tok")).toBeNull();
  });

  it("throws on other non-2xx (e.g. 500)", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    await expect(getChat("room-1", "tok")).rejects.toThrow("Failed to load chat (500)");
  });
});
