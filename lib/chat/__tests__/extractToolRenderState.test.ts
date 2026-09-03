import { describe, expect, it } from "vitest";
import { extractToolRenderState } from "@/lib/chat/extractToolRenderState";

describe("extractToolRenderState", () => {
  it("is running while the stream is live", () => {
    expect(extractToolRenderState({ state: "input-available" }, true)).toEqual({
      running: true,
      interrupted: false,
      error: undefined,
    });
  });

  // The bug this exists to prevent: a tool left mid-run when the stream ends
  // must never render as still running.
  it("is interrupted, not running, once the stream has ended", () => {
    const s = extractToolRenderState({ state: "input-streaming" }, false);
    expect(s.running).toBe(false);
    expect(s.interrupted).toBe(true);
  });

  it("surfaces errorText on output-error", () => {
    expect(
      extractToolRenderState({ state: "output-error", errorText: "Sandbox not found" }, true).error,
    ).toBe("Sandbox not found");
  });

  it("is neither running nor interrupted once output is available", () => {
    expect(extractToolRenderState({ state: "output-available" }, false)).toEqual({
      running: false,
      interrupted: false,
      error: undefined,
    });
  });
});
