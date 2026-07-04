import { describe, it, expect } from "vitest";
import type { UIMessage } from "ai";
import { getInitialMessageText } from "@/lib/chat/getInitialMessageText";

const message = (parts: UIMessage["parts"]): UIMessage[] => [
  { id: "m1", role: "user", parts },
];

describe("getInitialMessageText", () => {
  it("extracts the text of the first text part", () => {
    expect(
      getInitialMessageText(message([{ type: "text", text: "hello" }])),
    ).toBe("hello");
  });

  it("skips non-text parts", () => {
    expect(
      getInitialMessageText(
        message([
          { type: "file", url: "https://x/y.png", mediaType: "image/png" },
          { type: "text", text: "caption" },
        ]),
      ),
    ).toBe("caption");
  });

  it("returns undefined when there is nothing to prefill", () => {
    expect(getInitialMessageText(undefined)).toBeUndefined();
    expect(getInitialMessageText([])).toBeUndefined();
    expect(getInitialMessageText(message([]))).toBeUndefined();
    expect(
      getInitialMessageText(message([{ type: "text", text: "" }])),
    ).toBeUndefined();
  });
});
