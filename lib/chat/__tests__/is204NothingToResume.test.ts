import { describe, expect, it } from "vitest";
import { is204NothingToResume } from "@/lib/chat/is204NothingToResume";

/**
 * The reconnect stream answers `204 No Content` when there is nothing to
 * resume. `@workflow/ai` turns that into an error twice: first raw from the
 * fetch, then — after `maxConsecutiveErrors` — wrapped in a summary error that
 * no longer starts with the raw message. A guard that only matched the raw
 * form never fired, so "nothing to resume" was treated as a hard failure and
 * the client re-requested the stream forever (app#2052).
 */
describe("is204NothingToResume", () => {
  it("matches the raw error thrown inside the reconnect loop", () => {
    expect(is204NothingToResume(new Error("Failed to fetch chat: 204 "))).toBe(true);
  });

  it("matches the wrapped error that actually escapes reconnectToStream", () => {
    expect(
      is204NothingToResume(
        new Error(
          "Failed to reconnect after 3 consecutive errors. Last error: Failed to fetch chat: 204 ",
        ),
      ),
    ).toBe(true);
  });

  it("does not swallow a different status", () => {
    expect(is204NothingToResume(new Error("Failed to fetch chat: 500 boom"))).toBe(false);
    expect(
      is204NothingToResume(
        new Error("Failed to reconnect after 3 consecutive errors. Last error: Failed to fetch chat: 401 "),
      ),
    ).toBe(false);
  });

  it("does not match a 204 that is merely mentioned in unrelated text", () => {
    expect(is204NothingToResume(new Error("request 204 was fine"))).toBe(false);
  });

  it("ignores non-Error values", () => {
    expect(is204NothingToResume("Failed to fetch chat: 204")).toBe(false);
    expect(is204NothingToResume(undefined)).toBe(false);
  });
});
