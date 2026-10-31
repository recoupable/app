// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { UIMessage } from "ai";
import { MessageParts } from "@/components/VercelChat/MessageParts";
import { VercelChatContext } from "@/providers/VercelChatProvider";

const message = (
  state: string,
  extra: Record<string, unknown> = {},
  {
    id = "m1",
    tool = "bash",
    input = { command: "pnpm exec tsc --noEmit" } as Record<string, unknown>,
  } = {},
) =>
  ({
    id,
    role: "assistant",
    parts: [
      {
        type: `tool-${tool}`,
        toolCallId: `call-${id}`,
        state,
        input,
        ...extra,
      },
    ],
  }) as unknown as UIMessage;

const renderParts = (m: UIMessage) =>
  render(
    <MessageParts
      message={m}
      mode="view"
      setMode={() => {}}
      status="ready"
      reload={() => {}}
    />,
  );

function chatMessageWithProse(output: Record<string, unknown>): UIMessage {
  const response = message(
    "output-available",
    { output },
    { tool: "get_chats", input: {} },
  );
  return {
    ...response,
    parts: [
      { type: "text", text: "Here are the supplied chats.", state: "done" },
      ...response.parts,
      { type: "text", text: "The answer continues.", state: "done" },
    ],
  };
}

describe("MessageParts — empty SDK chat lookup", () => {
  it.each([
    ["Failed to retrieve chats", "Failed to retrieve chats"],
    ["", "Could not retrieve chats."],
    ["   ", "Could not retrieve chats."],
    ["\n <script>synthetic()</script>\n", "\n <script>synthetic()</script>\n"],
  ])("preserves a producer-declared failure (%j)", (reason, expected) => {
    const response = chatMessageWithProse({ success: false, message: reason });
    const { container } = renderParts(response);
    expect(screen.getByText("Here are the supplied chats.")).toBeTruthy();
    expect(screen.getByText("The answer continues.")).toBeTruthy();
    expect(screen.queryByText("No chats returned.")).toBeNull();
    expect(screen.queryByRole("heading", { name: "Chats" })).toBeNull();
    fireEvent.click(
      screen.getByRole("button", { name: /Tool failed.*Chat lookup/ }),
    );
    expect(
      screen.getByRole("region", { name: "Tool response text" }).textContent,
    ).toBe(expected);
    expect(container.querySelector("script")).toBeNull();
  });

  it.each([{ chats: [] }, { chats: null }, {}])(
    "preserves surrounding prose with quiet empty feedback (%j)",
    (output) => {
      const response = chatMessageWithProse(output);
      renderParts(response);
      expect(screen.getByText("Here are the supplied chats.")).toBeTruthy();
      expect(screen.getByText("The answer continues.")).toBeTruthy();
      expect(screen.getByText("No chats returned.").tagName).toBe("P");
      expect(screen.queryByRole("heading", { name: "Chats" })).toBeNull();
      expect(
        screen.queryByRole("button", { name: /Tool response|Tool failed/ }),
      ).toBeNull();
      expect(
        screen.getAllByRole("button", { name: "Copy response" }),
      ).toHaveLength(2);
    },
  );

  it("retains the populated single-chat link and count", () => {
    renderParts(
      message(
        "output-available",
        {
          output: {
            chats: [
              {
                id: "synthetic-chat",
                title: "Saved research",
                sessionId: "synthetic-session",
                accountId: "synthetic-account",
                updatedAt: "2026-10-22T00:00:00Z",
              },
            ],
          },
        },
        { tool: "get_chats", input: {} },
      ),
    );
    expect(screen.getByText("Found 1 chat")).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Saved research" }).getAttribute("href"),
    ).toBe("/sessions/synthetic-session/chats/synthetic-chat");
    expect(screen.queryByText("No chats returned.")).toBeNull();
  });

  it("retains explicit SDK error disclosure instead of claiming an empty result", () => {
    renderParts(
      message(
        "output-error",
        { errorText: "Synthetic chat lookup failed" },
        { tool: "get_chats", input: {} },
      ),
    );
    expect(screen.queryByText("No chats returned.")).toBeNull();
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Synthetic chat lookup failed")).toBeTruthy();
  });
});

describe("MessageParts — sandbox tool routing (app#2052)", () => {
  it("renders a non-bash output-error as an error row instead of crashing on a missing output", () => {
    // Before app#2055, output-error went to the loading branch (a skeleton that
    // never resolved). Routing it to the result branch must not hand the
    // success renderer an undefined output.
    const { container } = renderParts(
      message(
        "output-error",
        { errorText: "Sandbox not found: sbx_9f2c1a" },
        { tool: "read", input: { path: "README.md" } },
      ),
    );
    expect(container.querySelector(".skeleton")).toBeNull();
    expect(container.querySelector(".animate-spin")).toBeNull();
    expect(container.querySelector("svg.lucide-circle-x")).toBeTruthy();
    fireEvent.click(container.querySelector('[role="button"]')!);
    expect(screen.getByText("Sandbox not found: sbx_9f2c1a")).toBeTruthy();
  });

  it("renders a bash output-error with the error icon, not a spinner", () => {
    const { container } = renderParts(
      message("output-error", { errorText: "Sandbox not found: sbx_9f2c1a" }),
    );
    expect(container.querySelector(".animate-spin")).toBeNull();
    expect(container.querySelector("svg.lucide-circle-x")).toBeTruthy();
    expect(screen.getByText("Bash")).toBeTruthy();
  });

  it("does not present a non-zero exit as a success", () => {
    renderParts(
      message("output-available", {
        output: {
          success: false,
          exitCode: 2,
          stdout: "",
          stderr: "error TS2345",
        },
      }),
    );
    expect(screen.getByText("exit 2")).toBeTruthy();
  });

  it("shows the command as the summary", () => {
    renderParts(
      message("output-available", {
        output: { success: true, exitCode: 0, stdout: "ok" },
      }),
    );
    expect(screen.getByText("pnpm exec tsc --noEmit")).toBeTruthy();
  });

  it.each([
    [
      "stdout indentation and final newlines",
      "\n  indented output\n\n",
      "",
      "\n  indented output\n\n",
    ],
    [
      "stderr indentation and final newlines",
      "",
      "\n\tindented error\n\n",
      "\n\tindented error\n\n",
    ],
    [
      "both streams",
      "\n  stdout\n",
      "\n\tstderr\n\n",
      "\n  stdout\n\n\n\tstderr\n\n",
    ],
    ["whitespace-only stdout", " \t\n", "", " \t\n"],
    ["whitespace-only stderr", "", "\n\t ", "\n\t "],
  ])("preserves %s in expanded Bash details", (_, stdout, stderr, expected) => {
    const { container } = renderParts(
      message("output-available", {
        output: { success: true, exitCode: 0, stdout, stderr },
      }),
    );
    fireEvent.click(container.querySelector('[role="button"]')!);
    expect(container.querySelector("pre")?.textContent).toBe(expected);
  });

  it("preserves failed command details before the truncation notice", () => {
    const stderr = "\n  <script>literal output</script>\n\n";
    const { container } = renderParts(
      message("output-available", {
        output: { success: false, exitCode: 2, stderr, truncated: true },
      }),
    );
    fireEvent.click(container.querySelector('[role="button"]')!);
    const details = container.querySelector("pre");
    expect(details?.textContent).toBe(`${stderr}\n…output truncated`);
    expect(details?.children.length).toBe(0);
    expect(screen.getByText("exit 2")).toBeTruthy();
  });

  it("keeps the empty command-output fallback", () => {
    const { container } = renderParts(
      message("output-available", {
        output: { success: true, exitCode: 0, stdout: "", stderr: "" },
      }),
    );
    fireEvent.click(container.querySelector('[role="button"]')!);
    expect(container.querySelector("pre")?.textContent).toBe("(No output)");
  });

  it("does not spin an abandoned command from an earlier turn while a later turn streams", () => {
    const abandoned = message(
      "input-available",
      {},
      { id: "old", input: { command: "sleep 45" } },
    );
    const current = message(
      "input-available",
      {},
      { id: "new", input: { command: "ls" } },
    );
    const ctx = {
      status: "streaming",
      messages: [abandoned, current],
    } as unknown as React.ContextType<typeof VercelChatContext>;
    const { container } = render(
      <VercelChatContext.Provider value={ctx}>
        <MessageParts message={abandoned} mode="view" setMode={() => {}} />
      </VercelChatContext.Provider>,
    );
    expect(container.querySelector(".animate-spin")).toBeNull();
    expect(container.querySelector("svg.lucide-octagon-pause")).toBeTruthy();
  });

  it("renders one checklist per message, anchored where the plan started, showing the latest list", () => {
    const todo = (
      id: string,
      todos: Array<{ content: string; status: string }>,
    ) => ({
      type: "tool-todo_write",
      toolCallId: id,
      state: "output-available",
      input: { todos },
    });
    const m = {
      id: "plan",
      role: "assistant",
      parts: [
        todo("t1", [
          { content: "run pwd", status: "in_progress" },
          { content: "run date", status: "pending" },
        ]),
        {
          type: "tool-bash",
          toolCallId: "b1",
          state: "output-available",
          input: { command: "pwd" },
          output: { success: true, exitCode: 0, stdout: "/" },
        },
        todo("t2", [
          { content: "run pwd", status: "completed" },
          { content: "run date", status: "in_progress" },
        ]),
      ],
    } as unknown as UIMessage;
    const { container } = renderParts(m);
    const rows = [...container.querySelectorAll('[role="button"]')].map(
      (r) => r.textContent ?? "",
    );
    expect(rows.filter((t) => t.startsWith("Plan"))).toHaveLength(1);
    expect(rows[0]).toContain("1 of 2 done");
    expect(rows[1]).toContain("pwd");
  });
});
