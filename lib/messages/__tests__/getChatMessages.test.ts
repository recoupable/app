import { afterEach, expect, it, vi } from "vitest";
import { getChatMessages } from "../getChatMessages";
vi.mock("@/lib/api/getClientApiBaseUrl", () => ({
  getClientApiBaseUrl: () => "https://recoup.invalid",
}));
afterEach(() => vi.unstubAllGlobals());
it.each([401, 403, 404, 500, 503])(
  "rejects HTTP %s instead of returning empty history",
  async (status) => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status })),
    );
    await expect(getChatMessages("session", "chat", "token")).rejects.toThrow(
      `Failed to load messages: ${status}`,
    );
  },
);
it.each([{}, null, { messages: null }, { messages: {} }, []])(
  "rejects malformed history envelope %#",
  async (data) => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json(data)),
    );
    await expect(getChatMessages("session", "chat", "token")).rejects.toThrow(
      "invalid history response",
    );
  },
);
it("accepts explicit empty history and preserves the authenticated session/chat boundary", async () => {
  const fetch = vi.fn(async () => Response.json({ messages: [] }));
  vi.stubGlobal("fetch", fetch);
  await expect(
    getChatMessages("session/a", "chat/b", "synthetic-token"),
  ).resolves.toEqual([]);
  expect(fetch).toHaveBeenCalledWith(
    "https://recoup.invalid/api/sessions/session%2Fa/chats/chat%2Fb",
    { headers: { Authorization: "Bearer synthetic-token" } },
  );
});
