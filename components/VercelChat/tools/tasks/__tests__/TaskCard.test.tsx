// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import TaskCard, { type TaskCardProps } from "../TaskCard";
import { forbidTaskNetwork } from "./forbidTaskNetwork";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: React.ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
vi.mock("@/hooks/useArtistImage", () => ({
  default: () => ({ imageUrl: null, artistName: null }),
}));
vi.mock("@/hooks/useUpdateScheduledAction", () => ({
  useUpdateScheduledAction: () => ({ updateAction: vi.fn(), isLoading: false }),
}));
vi.mock("@/hooks/useDeleteScheduledAction", () => ({
  useDeleteScheduledAction: () => ({ deleteAction: vi.fn(), isLoading: false }),
}));

const task = {
  id: "task-a",
  title: "Weekly report",
  schedule: "0 9 * * *",
  enabled: true,
  artist_account_id: "",
  account_id: "synthetic-account",
  created_at: null,
  updated_at: null,
  model: null,
  prompt: "Synthetic report instructions",
  trigger_schedule_id: null,
} satisfies TaskCardProps["task"];

forbidTaskNetwork();

describe("task card schedules", () => {
  it.each([null, undefined, "", " \t\n "])(
    "renders a missing schedule (%j) without losing task navigation or actions",
    (schedule) => {
      // API/tool payloads can be incomplete despite the generated database type.
      const incompleteTask = { ...task, schedule } as TaskCardProps["task"];
      const { container } = render(<TaskCard task={incompleteTask} />);

      expect(screen.getByText("No schedule")).toBeTruthy();
      expect(container.querySelector(".lucide-repeat")).toBeNull();
      expect(screen.getByText("Active")).toBeTruthy();
      const link = screen.getByRole("link", { name: /Weekly report/ });
      const menu = screen.getByRole("button", {
        name: "Task options for Weekly report",
      });
      expect(link.getAttribute("href")).toBe("/tasks/task-a");
      expect(menu.closest("a")).toBeNull();
      expect(menu.parentElement).toBe(link.parentElement);
    },
  );

  it.each(["0 9 * * *", " 0 9 * * * "])(
    "keeps the human-readable label and recurring icon for %j",
    (schedule) => {
      const { container } = render(<TaskCard task={{ ...task, schedule }} />);

      expect(screen.getByText("At 09:00 AM")).toBeTruthy();
      expect(screen.queryByText("No schedule")).toBeNull();
      expect(container.querySelector(".lucide-repeat")).not.toBeNull();
    },
  );

  it("does not label a specific-date schedule as recurring", () => {
    const { container } = render(
      <TaskCard task={{ ...task, schedule: "0 9 25 10 *" }} />,
    );

    expect(
      screen.getByText("At 09:00 AM, on day 25 of the month, only in October"),
    ).toBeTruthy();
    expect(container.querySelector(".lucide-repeat")).toBeNull();
  });

  it("keeps a deleted task without a schedule static", () => {
    const incompleteTask = {
      ...task,
      schedule: null,
    } as unknown as TaskCardProps["task"];
    render(<TaskCard task={incompleteTask} isDeleted />);

    expect(screen.getByText("No schedule")).toBeTruthy();
    expect(screen.getByText("Deleted")).toBeTruthy();
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });
});
