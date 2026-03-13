import { describe, it, expect } from "vitest";
import { extractSendEmailResults } from "../extractSendEmailResults";
import { UIMessage } from "ai";

// Helper to create MCP tool output structure
const createMcpOutput = (data: { id?: string }) => ({
  content: [
    {
      type: "text",
      text: JSON.stringify({ success: true, data, message: "Email sent" }),
    },
  ],
  isError: false,
});

// Helper to create a send_email dynamic-tool part
const createSendEmailPart = (state: string, output?: ReturnType<typeof createMcpOutput>) =>
  ({
    type: "dynamic-tool",
    toolName: "send_email",
    state,
    output,
  }) as unknown as UIMessage["parts"][number];

describe("extractSendEmailResults", () => {
  it("returns empty array when no messages", () => {
    const result = extractSendEmailResults([]);
    expect(result).toEqual([]);
  });

  it("returns empty array when no send_email tool parts", () => {
    const messages: UIMessage[] = [
      {
        id: "msg-1",
        role: "assistant",
        parts: [{ type: "text", text: "Hello" }],
        content: "",
        createdAt: new Date(),
      },
    ];
    const result = extractSendEmailResults(messages);
    expect(result).toEqual([]);
  });

  it("extracts email ID from send_email tool result", () => {
    const messages: UIMessage[] = [
      {
        id: "msg-1",
        role: "assistant",
        parts: [createSendEmailPart("output-available", createMcpOutput({ id: "email-123" }))],
        content: "",
        createdAt: new Date(),
      },
    ];
    const result = extractSendEmailResults(messages);
    expect(result).toEqual([{ emailId: "email-123", messageId: "msg-1" }]);
  });

  it("extracts multiple email IDs from multiple messages", () => {
    const messages: UIMessage[] = [
      {
        id: "msg-1",
        role: "assistant",
        parts: [createSendEmailPart("output-available", createMcpOutput({ id: "email-1" }))],
        content: "",
        createdAt: new Date(),
      },
      {
        id: "msg-2",
        role: "assistant",
        parts: [createSendEmailPart("output-available", createMcpOutput({ id: "email-2" }))],
        content: "",
        createdAt: new Date(),
      },
    ];
    const result = extractSendEmailResults(messages);
    expect(result).toEqual([
      { emailId: "email-1", messageId: "msg-1" },
      { emailId: "email-2", messageId: "msg-2" },
    ]);
  });

  it("ignores tool parts without output-available state", () => {
    const messages: UIMessage[] = [
      {
        id: "msg-1",
        role: "assistant",
        parts: [createSendEmailPart("pending")],
        content: "",
        createdAt: new Date(),
      },
    ];
    const result = extractSendEmailResults(messages);
    expect(result).toEqual([]);
  });

  it("ignores tool parts with missing data.id", () => {
    const messages: UIMessage[] = [
      {
        id: "msg-1",
        role: "assistant",
        parts: [createSendEmailPart("output-available", createMcpOutput({}))],
        content: "",
        createdAt: new Date(),
      },
    ];
    const result = extractSendEmailResults(messages);
    expect(result).toEqual([]);
  });

  it("extracts email IDs from message with mixed parts", () => {
    const messages: UIMessage[] = [
      {
        id: "msg-1",
        role: "assistant",
        parts: [
          { type: "text", text: "I'll send that email for you" },
          createSendEmailPart("output-available", createMcpOutput({ id: "email-abc" })),
          { type: "text", text: "Email sent!" },
        ],
        content: "",
        createdAt: new Date(),
      },
    ];
    const result = extractSendEmailResults(messages);
    expect(result).toEqual([{ emailId: "email-abc", messageId: "msg-1" }]);
  });
});
