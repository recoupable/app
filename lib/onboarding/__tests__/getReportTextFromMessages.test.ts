import { describe, expect, it } from "vitest";
import type { UIMessage } from "ai";
import { getReportTextFromMessages } from "@/lib/onboarding/getReportTextFromMessages";

const user = (text: string): UIMessage => ({
  id: "u1",
  role: "user",
  parts: [{ type: "text", text }],
});

const assistant = (id: string, parts: UIMessage["parts"]): UIMessage => ({
  id,
  role: "assistant",
  parts,
});

describe("getReportTextFromMessages", () => {
  it("returns empty string when no assistant message exists yet", () => {
    expect(getReportTextFromMessages([])).toBe("");
    expect(getReportTextFromMessages([user("write my report")])).toBe("");
  });

  it("returns the last assistant message's text parts joined", () => {
    const messages = [
      user("write my report"),
      assistant("a1", [
        { type: "text", text: "# Weekly Report" },
        { type: "text", text: "Streams are up." },
      ]),
    ];
    expect(getReportTextFromMessages(messages)).toBe(
      "# Weekly Report\n\nStreams are up.",
    );
  });

  it("ignores non-text parts (reasoning, tool calls)", () => {
    const messages = [
      user("write my report"),
      assistant("a1", [
        { type: "reasoning", text: "thinking..." },
        { type: "text", text: "Report body" },
      ] as UIMessage["parts"]),
    ];
    expect(getReportTextFromMessages(messages)).toBe("Report body");
  });

  it("uses the latest assistant message when there are several", () => {
    const messages = [
      user("write my report"),
      assistant("a1", [{ type: "text", text: "old" }]),
      user("again"),
      assistant("a2", [{ type: "text", text: "new" }]),
    ];
    expect(getReportTextFromMessages(messages)).toBe("new");
  });
});
