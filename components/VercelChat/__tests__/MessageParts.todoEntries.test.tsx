// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { UIMessage } from "ai";
import { MessageParts } from "@/components/VercelChat/MessageParts";

afterEach(cleanup);

const items = [
  { content: "Draft the brief", status: "completed" },
  {
    content: "Review the sources",
    status: "in_progress",
    activeForm: "Checking sources",
  },
];

const renderPlan = (
  todos: unknown[],
  state = "output-available",
  status: "ready" | "streaming" = "ready",
  errorText?: string,
) => {
  const message = {
    id: "todo-entries",
    role: "assistant",
    parts: [
      { type: "text", text: "Here is the current plan." },
      {
        type: "tool-todo_write",
        toolCallId: "todo-entries-call",
        input: { todos },
        state,
        errorText,
      },
      { type: "text", text: "We can continue from here." },
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

describe("MessageParts — missing checklist entries", () => {
  it.each([
    ["output-available", "ready", undefined],
    ["input-streaming", "streaming", undefined],
    ["output-error", "ready", "Checklist was not saved."],
  ] as const)(
    "retains valid items and the response in %s",
    (state, status, errorText) => {
      const { container } = renderPlan(
        [null, items[0], undefined, items[1]],
        state,
        status,
        errorText,
      );
      expect(screen.getByText("Here is the current plan.")).toBeTruthy();
      expect(screen.getByText("We can continue from here.")).toBeTruthy();
      expect(screen.getByText("1 of 2 done")).toBeTruthy();
      expect(screen.getByText("Checking sources")).toBeTruthy();
      const row = screen.getByRole("button", { name: /^Plan/ });
      expect(row.getAttribute("aria-expanded")).toBe("false");
      expect(screen.queryAllByRole("listitem")).toHaveLength(0);

      fireEvent.click(row);
      expect(
        screen.getAllByRole("listitem").map((li) => li.textContent),
      ).toEqual([
        "Completed: Draft the brief",
        "In progress: Review the sources",
      ]);
      expect(
        [...container.querySelectorAll("pre")].map((p) => p.textContent),
      ).toEqual(errorText ? [errorText] : []);
    },
  );

  it("uses the existing empty plan state when every entry is missing", () => {
    renderPlan([null, undefined]);
    expect(screen.getByText("Here is the current plan.")).toBeTruthy();
    expect(screen.getByText("We can continue from here.")).toBeTruthy();
    expect(screen.getByText("…")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /^Plan/ })).toBeNull();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  it("preserves the same summary and order for an intact list", () => {
    renderPlan(items);
    expect(screen.getByText("1 of 2 done")).toBeTruthy();
    expect(screen.getByText("Checking sources")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /^Plan/ }));
    expect(screen.getAllByRole("listitem").map((li) => li.textContent)).toEqual(
      ["Completed: Draft the brief", "In progress: Review the sources"],
    );
  });
});
