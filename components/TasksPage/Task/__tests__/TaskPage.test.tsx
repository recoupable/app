// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TaskPage from "@/components/TasksPage/Task/TaskPage";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const loadedTask = {
  id: "task-a",
  title: "Weekly report",
  prompt: "Do the thing",
  schedule: "0 9 * * *",
  model: "anthropic/claude-sonnet-5",
  timezone: "UTC",
  enabled: true,
};
const taskQuery: {
  data: typeof loadedTask | null | undefined;
  isPending: boolean;
  isLoading: boolean;
  error: Error | null;
} = { data: loadedTask, isPending: false, isLoading: false, error: null };
vi.mock("@/hooks/useTask", () => ({ useTask: () => taskQuery }));

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
  beforeEach(() => {
    Object.assign(taskQuery, {
      data: loadedTask,
      isPending: false,
      isLoading: false,
      error: null,
    });
  });

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

  it("renders inside the shared centered container (app#2016 item 3)", () => {
    const { container } = render(<TaskPage taskId="task-a" />);
    const root = container.firstElementChild as HTMLElement;
    for (const cls of ["mx-auto", "w-full", "max-w-2xl", "px-6"]) {
      expect(root.className).toContain(cls);
    }
  });

  it("shows the skeleton, not the not-found copy, while the query is pending but not yet fetching (app#2016 item 4)", () => {
    Object.assign(taskQuery, {
      data: undefined,
      isPending: true,
      isLoading: false,
    });
    render(<TaskPage taskId="task-a" />);
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.getByText("…")).toBeTruthy();
  });

  it("shows the not-found copy once the query resolves with no task", () => {
    Object.assign(taskQuery, {
      data: null,
      isPending: false,
      isLoading: false,
    });
    render(<TaskPage taskId="task-a" />);
    expect(screen.getByRole("status").textContent).toBe(
      "No task with this id on your account.",
    );
  });
});
