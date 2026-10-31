// @vitest-environment jsdom
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { UIMessage } from "ai";
import { MessageParts } from "../MessageParts";

afterEach(cleanup);

function renderResult(output: unknown, toolName = "lookup_records") {
  const reload = vi.fn();
  const message = {
    id: "synthetic-mcp-response",
    role: "assistant",
    parts: [
      { type: "text", text: "Here is the supplied result.", state: "done" },
      {
        type: "dynamic-tool",
        toolName,
        toolCallId: "synthetic-call",
        state: "output-available",
        input: {},
        output,
      },
      { type: "text", text: "I can help interpret it.", state: "done" },
    ],
  } as unknown as UIMessage;
  return {
    ...render(
      <MessageParts
        message={message}
        mode="view"
        setMode={() => {}}
        status="ready"
        reload={reload}
      />,
    ),
    reload,
  };
}

function textOutput(text: string) {
  return { content: [{ type: "text", text }] };
}

describe("MCP result fallbacks in a composed assistant message", () => {
  it.each([
    [
      "Access denied to specified account_id",
      "Access denied to specified account_id",
    ],
    ["", "Could not retrieve chats."],
    ["   ", "Could not retrieve chats."],
    ["\n <script>synthetic()</script>\n", "\n <script>synthetic()</script>\n"],
  ])(
    "preserves a producer-declared chat lookup failure (%j)",
    (message, expected) => {
      const { reload, container } = renderResult(
        textOutput(JSON.stringify({ success: false, message })),
        "get_chats",
      );
      expect(screen.getByText("Here is the supplied result.")).toBeTruthy();
      expect(screen.getByText("I can help interpret it.")).toBeTruthy();
      expect(screen.queryByText("No chats returned.")).toBeNull();
      expect(screen.queryByRole("heading", { name: "Chats" })).toBeNull();
      fireEvent.click(
        screen.getByRole("button", { name: /Tool failed.*Chat lookup/ }),
      );
      expect(
        screen.getByRole("region", { name: "Tool response text" }).textContent,
      ).toBe(expected);
      expect(container.querySelector("script")).toBeNull();
      expect(reload).not.toHaveBeenCalled();
    },
  );

  it.each([{ chats: [] }, { chats: null }, {}])(
    "keeps an empty chat lookup quiet within the answer (%j)",
    (result) => {
      const { reload } = renderResult(
        textOutput(JSON.stringify(result)),
        "get_chats",
      );
      expect(screen.getByText("Here is the supplied result.")).toBeTruthy();
      expect(screen.getByText("I can help interpret it.")).toBeTruthy();
      expect(screen.getByText("No chats returned.").tagName).toBe("P");
      expect(screen.queryByRole("heading", { name: "Chats" })).toBeNull();
      expect(
        screen.queryByRole("button", { name: /Tool response|Tool failed/ }),
      ).toBeNull();
      expect(
        screen.getAllByRole("button", { name: "Copy response" }),
      ).toHaveLength(2);
      expect(reload).not.toHaveBeenCalled();
    },
  );

  it.each(["lookup_records", "search_web"])(
    "keeps prose and plain text readable for %s without retrying",
    (toolName) => {
      const text =
        "No records matched the supplied query.\nTry a narrower name.";
      const { reload, container } = renderResult(textOutput(text), toolName);
      expect(screen.getByText("Here is the supplied result.")).toBeTruthy();
      expect(screen.getByText("I can help interpret it.")).toBeTruthy();
      expect(screen.queryByText("Data processed")).toBeNull();
      expect(
        screen.queryByRole("region", { name: "Tool response text" }),
      ).toBeNull();
      fireEvent.click(screen.getByRole("button", { name: /Tool response/ }));
      expect(
        screen.getByRole("region", { name: "Tool response text" }).textContent,
      ).toBe(text);
      expect(container.querySelector(".animate-spin")).toBeNull();
      expect(reload).not.toHaveBeenCalled();
    },
  );

  it("renders supplied HTML as literal text", () => {
    const text =
      '<a href="https://example.invalid">Open</a><script>run()</script>';
    const { container } = renderResult(textOutput(text));
    fireEvent.click(screen.getByRole("button", { name: /Tool response/ }));
    expect(
      screen.getByRole("region", { name: "Tool response text" }).textContent,
    ).toBe(text);
    expect(
      container.querySelector('a[href="https://example.invalid"]'),
    ).toBeNull();
    expect(container.querySelector("script")).toBeNull();
  });

  it("preserves ordered text blocks when another content kind comes first", () => {
    renderResult({
      content: [
        { type: "image", data: "synthetic", mimeType: "image/png" },
        { type: "text", text: "First supplied note." },
        { type: "text", text: "Second supplied note." },
      ],
    });
    fireEvent.click(screen.getByRole("button", { name: /Tool response/ }));
    expect(
      screen.getByRole("region", { name: "Tool response text" }).textContent,
    ).toBe("First supplied note.\n\nSecond supplied note.");
  });

  it.each([
    ["null", "null"],
    ["12", "12"],
    ['"Ready"', "Ready"],
  ])("keeps JSON primitive %s readable", (payload, expected) => {
    renderResult(textOutput(payload));
    fireEvent.click(screen.getByRole("button", { name: /Tool response/ }));
    expect(
      screen.getByRole("region", { name: "Tool response text" }).textContent,
    ).toBe(expected);
  });

  it.each([
    undefined,
    null,
    {},
    { content: [] },
    { content: [{ type: "text", text: 7 }] },
    textOutput('""'),
    textOutput("   "),
  ])(
    "keeps an unavailable text result from crashing the surrounding answer (%j)",
    (output) => {
      const { container } = renderResult(output);
      expect(screen.getByText("Here is the supplied result.")).toBeTruthy();
      expect(screen.getByText("I can help interpret it.")).toBeTruthy();
      expect(screen.getByText("No text response available")).toBeTruthy();
      expect(container.querySelector(".animate-spin")).toBeNull();
      expect(screen.queryByText("Data processed")).toBeNull();
    },
  );

  it("keeps valid JSON on its existing typed renderer", () => {
    renderResult(
      textOutput(
        JSON.stringify({
          chats: [
            {
              id: "synthetic-chat",
              title: "Synthetic saved chat",
              accountId: "synthetic-account",
              sessionId: "synthetic-session",
              updatedAt: "2026-10-01T00:00:00Z",
            },
          ],
        }),
      ),
      "get_chats",
    );
    expect(
      screen
        .getByRole("link", { name: "Synthetic saved chat" })
        .getAttribute("href"),
    ).toBe("/sessions/synthetic-session/chats/synthetic-chat");
    expect(screen.queryByRole("button", { name: /Tool response/ })).toBeNull();
  });

  it.each([
    [
      textOutput("The supplied query was rejected."),
      "The supplied query was rejected.",
    ],
    [
      textOutput('{"chats":[],"message":"Access denied"}'),
      '{"chats":[],"message":"Access denied"}',
    ],
    [
      {
        content: [
          { type: "image", data: "synthetic", mimeType: "image/png" },
          { type: "text", text: "First error." },
          { type: "text", text: "Second error." },
        ],
      },
      "First error.\n\nSecond error.",
    ],
  ])(
    "preserves explicit MCP failure details instead of showing a typed success (%j)",
    (output, details) => {
      const { reload } = renderResult(
        { ...output, isError: true },
        "get_chats",
      );
      expect(screen.getByText("Here is the supplied result.")).toBeTruthy();
      expect(screen.getByText("I can help interpret it.")).toBeTruthy();
      expect(screen.queryByRole("heading", { name: "Chats" })).toBeNull();
      expect(screen.queryByText("Data processed")).toBeNull();
      fireEvent.click(
        screen.getByRole("button", { name: /Tool failed.*get_chats/ }),
      );
      expect(
        screen.getByRole("region", { name: "Tool response text" }).textContent,
      ).toBe(details);
      expect(reload).not.toHaveBeenCalled();
    },
  );

  it.each([{}, { content: [] }, textOutput("   ")])(
    "makes explicit MCP failure clear when details are absent (%j)",
    (output) => {
      renderResult({ ...output, isError: true });
      fireEvent.click(
        screen.getByRole("button", { name: /Tool failed.*lookup_records/ }),
      );
      expect(
        screen.getByRole("region", { name: "Tool response text" }).textContent,
      ).toBe("The tool reported an error without text details.");
      expect(screen.queryByText("No text response available")).toBeNull();
    },
  );

  it.each([false, "true"])(
    "only treats a boolean true isError flag as failure (%j)",
    (isError) => {
      renderResult({ ...textOutput("Ordinary response."), isError });
      expect(
        screen.getByRole("button", { name: /Tool response.*lookup_records/ }),
      ).toBeTruthy();
      expect(screen.queryByText("Tool failed")).toBeNull();
    },
  );

  it("does not render a non-string generic message as a React child", () => {
    renderResult(textOutput(JSON.stringify({ message: { unexpected: true } })));
    expect(screen.getByText("Data processed")).toBeTruthy();
    expect(screen.getByText("I can help interpret it.")).toBeTruthy();
  });
});
