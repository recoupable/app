import { describe, it, expect } from "vitest";
import { buildStreamReconnectUrl } from "@/lib/chat/buildStreamReconnectUrl";

const API = "https://api.test/api/chat";
const CHAT = "11111111-2222-4333-8444-555555555555";

describe("buildStreamReconnectUrl", () => {
  // The SDK only falls back to `${api}/${id}/stream` when the callback returns
  // no `api`. Returning one replaces the whole URL, so the path is rebuilt
  // here rather than appended to — appending to the base produced a GET
  // against the POST-only `/api/chat` and 405s.
  it("rebuilds the full resume path from the base", () => {
    expect(buildStreamReconnectUrl(API, CHAT, null)).toBe(`${API}/${CHAT}/stream`);
  });

  it("resumes from the chunk after the last one received", () => {
    expect(buildStreamReconnectUrl(API, CHAT, 347)).toBe(
      `${API}/${CHAT}/stream?startIndex=348`,
    );
  });

  it("treats index 0 as a real position, not as absent", () => {
    expect(buildStreamReconnectUrl(API, CHAT, 0)).toBe(`${API}/${CHAT}/stream?startIndex=1`);
  });
});
