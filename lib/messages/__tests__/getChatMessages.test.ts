import { describe, it, expect, vi, beforeEach } from "vitest";
import getChatMessages from "../getChatMessages";

const mockFetch = vi.fn();
global.fetch = mockFetch;

const messages = [
  { id: "m1", role: "user", parts: [{ type: "text", text: "hi" }] },
  { id: "m2", role: "assistant", parts: [{ type: "text", text: "hello" }] },
];

describe("getChatMessages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reads chat_messages via the session-chat endpoint and returns messages", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ chat: {}, isStreaming: false, messages }),
    });

    const result = await getChatMessages("sess-1", "room-1", "tok");

    expect(result).toEqual(messages);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/sessions/sess-1/chats/room-1"),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer tok" }),
      }),
    );
  });

  it("returns [] when the response has no messages", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ chat: {} }) });
    expect(await getChatMessages("sess-1", "room-1", "tok")).toEqual([]);
  });

  it("returns [] when the response is not ok", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });
    expect(await getChatMessages("sess-1", "room-1", "tok")).toEqual([]);
  });

  it("returns [] when fetch throws", async () => {
    mockFetch.mockRejectedValueOnce(new Error("network"));
    expect(await getChatMessages("sess-1", "room-1", "tok")).toEqual([]);
  });
});
