// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TodoRenderer } from "@/components/VercelChat/tools/agent/TodoRenderer";

describe("TodoRenderer", () => {
  it("names each item's status for assistive technology", () => {
    const { container } = render(
      <TodoRenderer
        input={{
          todos: [
            { content: "run pwd", status: "completed" },
            { content: "run date", status: "in_progress" },
            { content: "run whoami", status: "pending" },
          ],
        }}
        state={{ running: false, interrupted: false }}
      />,
    );
    fireEvent.click(container.querySelector('[role="button"]')!);
    const items = [...container.querySelectorAll("li")].map(
      (li) => li.textContent,
    );
    expect(items).toEqual([
      "Completed: run pwd",
      "In progress: run date",
      "Pending: run whoami",
    ]);
    expect(screen.getByText("Completed:").className).toContain("sr-only");
  });
});
