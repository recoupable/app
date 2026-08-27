// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import TaskEditor from "@/components/TasksPage/Task/TaskEditor";
import type { Task } from "@/lib/tasks/getTasks";

const push = vi.fn();
let search = "";
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(search),
}));
vi.mock("@/components/TasksPage/Task/TaskDetails", () => ({
  default: () => null,
}));
vi.mock("@/components/TasksPage/Task/TaskActions", () => ({
  default: ({ onDeleteSuccess }: { onDeleteSuccess: () => void }) => (
    <button type="button" onClick={onDeleteSuccess}>
      Delete
    </button>
  ),
}));

const task = {
  id: "task-a",
  account_id: "acct-customer",
  title: "T",
  prompt: "p",
  schedule: "0 9 * * *",
  enabled: true,
} as unknown as Task;

describe("TaskEditor (app#2016 item 2)", () => {
  it("returns to the same account's task list after a delete, keeping ?account_id=", () => {
    search = "account_id=acct-customer";
    render(<TaskEditor task={task} />);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(push).toHaveBeenCalledWith("/tasks?account_id=acct-customer");
  });

  it("returns to /tasks when there is no account override in the URL", () => {
    search = "";
    push.mockClear();
    render(<TaskEditor task={task} />);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(push).toHaveBeenCalledWith("/tasks");
  });
});
