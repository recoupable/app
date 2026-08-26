// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import TaskPage from "@/components/TasksPage/Task/TaskPage";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

vi.mock("@/hooks/useTask", () => ({
  useTask: () => ({
    data: {
      id: "task-a",
      title: "Weekly report",
      prompt: "Do the thing",
      schedule: "0 9 * * *",
      model: "anthropic/claude-sonnet-5",
      timezone: "UTC",
      enabled: true,
    },
    isLoading: false,
    error: null,
  }),
}));

vi.mock("@/components/TasksPage/Task/TaskBreadcrumb", () => ({
  default: ({ title }: { title: string }) => <nav>{title}</nav>,
}));
vi.mock("@/components/TasksPage/Task/TaskDetails", () => ({
  default: ({ editTitle }: { editTitle: string }) => (
    <input aria-label="Name" value={editTitle} readOnly />
  ),
}));
vi.mock("@/components/TasksPage/Task/TaskActions", () => ({
  default: ({ onDeleteSuccess }: { onDeleteSuccess: () => void }) => (
    <button type="button" onClick={onDeleteSuccess}>
      Delete
    </button>
  ),
}));

describe("TaskPage (chat#2006 item 8)", () => {
  it("renders the editable details with the task's current values", () => {
    render(<TaskPage taskId="task-a" />);
    expect((screen.getByLabelText("Name") as HTMLInputElement).value).toBe(
      "Weekly report",
    );
  });

  it("returns to the task list after a delete", () => {
    render(<TaskPage taskId="task-a" />);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(push).toHaveBeenCalledWith("/tasks");
  });
});
