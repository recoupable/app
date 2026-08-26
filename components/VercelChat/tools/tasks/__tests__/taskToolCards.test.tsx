// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import GetTasksSuccess from "@/components/VercelChat/tools/tasks/GetTasksSuccess";
import CreateTaskSuccess from "@/components/VercelChat/tools/tasks/CreateTaskSuccess";
import UpdateTaskSuccess from "@/components/VercelChat/tools/tasks/UpdateTaskSuccess";
import DeleteTaskSuccess from "@/components/VercelChat/tools/tasks/DeleteTaskSuccess";
import type { ScheduledAction } from "@/components/VercelChat/types";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: React.ComponentProps<"a"> & { href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/VercelChat/tools/tasks/TaskCard", () => ({
  default: ({ task }: { task: ScheduledAction }) => <div>{task.title}</div>,
}));

const task = {
  id: "task-a",
  title: "Weekly report",
  schedule: "0 9 * * *",
  enabled: true,
} as unknown as ScheduledAction;

describe("task tool cards (chat#2006 item 8)", () => {
  it("get_tasks cards link to the task page", () => {
    render(<GetTasksSuccess result={[task]} />);
    expect(screen.getByRole("link").getAttribute("href")).toBe("/tasks/task-a");
  });

  it("create_task and update_task cards link to the task page", () => {
    render(<CreateTaskSuccess result={task} />);
    render(<UpdateTaskSuccess result={task} />);
    expect(
      screen.getAllByRole("link").map((l) => l.getAttribute("href")),
    ).toEqual(["/tasks/task-a", "/tasks/task-a"]);
  });

  it("a deleted task card has no link, since its page no longer exists", () => {
    render(<DeleteTaskSuccess result={task} />);
    expect(screen.getByText("Weekly report")).toBeTruthy();
    expect(screen.queryByRole("link")).toBeNull();
  });
});
