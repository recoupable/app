import { describe, it, expect } from "vitest";
import {
  buildStreamReconnectUrl,
  REFRESH_RESUME_WINDOW,
} from "@/lib/chat/buildStreamReconnectUrl";

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

  // A fresh page load has no counted position, so today it resumes from chunk
  // zero and replays the entire turn — 418 chunks in the verified prod run.
  // A negative index asks the server for just the recent tail; the route
  // reports where that landed via `x-workflow-stream-tail-index`, which is
  // what lets subsequent retries go back to absolute positions.
  it("requests a bounded window when resuming a turn it never saw", () => {
    expect(buildStreamReconnectUrl(API, CHAT, null, { isFreshLoad: true })).toBe(
      `${API}/${CHAT}/stream?startIndex=${REFRESH_RESUME_WINDOW}`,
    );
  });

  it("uses a negative window, so the server reads back from the end", () => {
    expect(REFRESH_RESUME_WINDOW).toBeLessThan(0);
  });

  // A counted position always beats a guess.
  it("prefers a known position over the refresh window", () => {
    expect(buildStreamReconnectUrl(API, CHAT, 347, { isFreshLoad: true })).toBe(
      `${API}/${CHAT}/stream?startIndex=348`,
    );
  });

  it("still reads from the beginning for a non-fresh reconnect with no position", () => {
    expect(buildStreamReconnectUrl(API, CHAT, null, { isFreshLoad: false })).toBe(
      `${API}/${CHAT}/stream`,
    );
  });
});
