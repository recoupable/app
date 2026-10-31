// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { UIMessage } from "ai";
import { MessageParts } from "@/components/VercelChat/MessageParts";

afterEach(cleanup);

const todos = [
  { content: "Draft the brief", status: "pending" },
  { content: "Review the sources", status: "pending" },
];

const renderTool = (
  tool: string,
  input: Record<string, unknown>,
  errorText?: string,
  state = "output-error",
  status: "ready" | "streaming" = "ready",
) => {
  const message = {
    id: "tool-error-details",
    role: "assistant",
    parts: [
      {
        type: `tool-${tool}`,
        toolCallId: "tool-error-details-call",
        state,
        input,
        errorText,
      },
    ],
  } as unknown as UIMessage;
  return render(
    <MessageParts
      message={message}
      mode="view"
      setMode={() => {}}
      status={status}
      reload={() => {}}
    />,
  );
};

describe("MessageParts — tool errors alongside custom details", () => {
  it.each(["ready", "streaming"] as const)(
    "retains a failed plan's literal reason and checklist while %s",
    (status) => {
      const reason =
        "\n  Plan not saved.\n<script>literal details</script>\n\n";
      const { container } = renderTool(
        "todo_write",
        { todos },
        reason,
        "output-error",
        status,
      );
      const row = screen.getByRole("button", { name: /^Plan\s*0 of 2 done$/ });
      expect(row.getAttribute("aria-expanded")).toBe("false");
      expect(container.querySelector("pre")).toBeNull();
      expect(container.querySelector(".animate-spin")).toBeNull();
      expect(container.querySelector("svg.lucide-circle-x")).toBeTruthy();

      fireEvent.click(row);
      const reasons = [...container.querySelectorAll("pre")].filter(
        (element) => element.textContent === reason,
      );
      expect(reasons).toHaveLength(1);
      expect(reasons[0].children.length).toBe(0);
      expect(screen.getByText("Draft the brief")).toBeTruthy();
      expect(screen.getByText("Review the sources")).toBeTruthy();
    },
  );

  it.each([
    ["todo_write", { todos: [] }, /^Plan\s*…$/],
    ["skill", { skill: "brief" }, /^Skill\s*\/brief$/],
    [
      "skill",
      { skill: "brief", args: "Use the supplied notes." },
      /^Skill\s*\/brief$/,
    ],
    ["bash", { command: "inspect notes" }, /^Bash\s*inspect notes$/],
    ["read", { path: "notes.txt" }, "read"],
  ] as const)(
    "keeps one failure reason for %s with %j",
    (tool, input, name) => {
      const reason = "\n  Tool unavailable.\nTry the supplied input.\n";
      const { container } = renderTool(tool, input, reason);
      fireEvent.click(screen.getByRole("button", { name }));
      expect(
        [...container.querySelectorAll("pre")].filter(
          (element) => element.textContent === reason,
        ),
      ).toHaveLength(1);
      if (tool === "skill" && "args" in input) {
        expect(screen.getByText("Use the supplied notes.")).toBeTruthy();
      }
    },
  );

  it("keeps successful plan details without an error block", () => {
    const { container } = renderTool(
      "todo_write",
      { todos },
      undefined,
      "output-available",
    );
    fireEvent.click(
      screen.getByRole("button", { name: /^Plan\s*0 of 2 done$/ }),
    );
    expect(screen.getByText("Draft the brief")).toBeTruthy();
    expect(screen.getByText("Review the sources")).toBeTruthy();
    expect(container.querySelector("pre")).toBeNull();
    expect(container.querySelector("svg.lucide-circle-x")).toBeNull();
  });
});
