import { describe, it, expect, vi, beforeEach } from "vitest";
import { stopChatWorkflow } from "../stopChatWorkflow";
import { NEW_API_BASE_URL } from "../../consts";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("stopChatWorkflow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("POSTs to the chat stop endpoint with a bearer token", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    await stopChatWorkflow("chat-1", "tok-123");

    expect(mockFetch).toHaveBeenCalledWith(
      `${NEW_API_BASE_URL}/api/chat/chat-1/stop`,
      {
        method: "POST",
        headers: { Authorization: "Bearer tok-123" },
      },
    );
  });

  it("omits the Authorization header when unauthenticated", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    await stopChatWorkflow("chat-1", null);

    expect(mockFetch).toHaveBeenCalledWith(
      `${NEW_API_BASE_URL}/api/chat/chat-1/stop`,
      { method: "POST", headers: {} },
    );
  });

  it("url-encodes the chat id", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    await stopChatWorkflow("a/b c", "tok");

    expect(mockFetch).toHaveBeenCalledWith(
      `${NEW_API_BASE_URL}/api/chat/a%2Fb%20c/stop`,
      expect.any(Object),
    );
  });

  it("never throws when the request fails", async () => {
    mockFetch.mockRejectedValueOnce(new Error("network down"));

    await expect(stopChatWorkflow("chat-1", "tok")).resolves.toBeUndefined();
  });
});
