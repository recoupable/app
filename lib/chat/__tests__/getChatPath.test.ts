import { afterEach, describe, expect, it, vi } from "vitest";
import { getChatPath } from "@/lib/chat/getChatPath";

describe("getChatPath", () => {
  afterEach(() => vi.unstubAllEnvs());
  it("builds a session-scoped chat path", () => {
    expect(getChatPath("sess-1", "chat-2")).toBe(
      "/sessions/sess-1/chats/chat-2",
    );
  });
  it("retains an explicit catalog reference on canonical development URL updates", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_RECOUP_INTELLIGENT_UI_CHAT", "true");
    vi.stubEnv("VERCEL_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_VERCEL_ENV", "development");
    expect(
      getChatPath("sess-1", "chat-2", "11111111-1111-4111-8111-111111111111"),
    ).toBe(
      "/sessions/sess-1/chats/chat-2?catalogId=11111111-1111-4111-8111-111111111111",
    );
    expect(getChatPath("sess-1", "chat-2", ["invalid & ref", "second"])).toBe(
      "/sessions/sess-1/chats/chat-2?catalogId=invalid+%26+ref&catalogId=second",
    );
    expect(
      getChatPath("sess-1", "chat-2", "catalog-ref", {
        since: ["bad & date", "2026-09-01"],
        days: [],
        page: "2",
        limit: "",
      }),
    ).toBe(
      "/sessions/sess-1/chats/chat-2?catalogId=catalog-ref&since=bad+%26+date&since=2026-09-01&days=&page=2&limit=",
    );
    expect(getChatPath("sess-1", "chat-2", [])).toBe(
      "/sessions/sess-1/chats/chat-2?catalogId=",
    );
  });
  it.each(["production", "disabled"])("keeps the %s URL unchanged", (mode) => {
    vi.stubEnv(
      "NODE_ENV",
      mode === "production" ? "production" : "development",
    );
    vi.stubEnv(
      "NEXT_PUBLIC_RECOUP_INTELLIGENT_UI_CHAT",
      mode === "disabled" ? "false" : "true",
    );
    expect(getChatPath("sess-1", "chat-2", "catalog-ref")).toBe(
      "/sessions/sess-1/chats/chat-2",
    );
  });
});
