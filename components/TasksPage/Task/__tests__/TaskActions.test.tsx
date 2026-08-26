// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TaskActions from "@/components/TasksPage/Task/TaskActions";

const updateAction = vi.fn().mockResolvedValue(undefined);
const deleteAction = vi.fn(
  async ({ onSuccess }: { actionId: string; onSuccess?: () => void }) => {
    onSuccess?.();
  },
);

vi.mock("@/hooks/useUpdateScheduledAction", () => ({
  useUpdateScheduledAction: () => ({ updateAction, isLoading: false }),
}));
vi.mock("@/hooks/useDeleteScheduledAction", () => ({
  useDeleteScheduledAction: () => ({ deleteAction, isLoading: false }),
}));

const edits = {
  taskId: "task-a",
  editTitle: "Renamed",
  editPrompt: "New instructions",
  editCron: " 0 4 * * * ",
  editModel: "anthropic/claude-sonnet-5",
  editTimezone: "America/New_York",
};

describe("TaskActions", () => {
  beforeEach(() => {
    updateAction.mockClear();
    deleteAction.mockClear();
  });

  it("Save sends every edited field, with the cron trimmed", async () => {
    render(<TaskActions {...edits} isEnabled onDeleteSuccess={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(updateAction).toHaveBeenCalledTimes(1));
    expect(updateAction.mock.calls[0][0].updates).toEqual({
      id: "task-a",
      title: "Renamed",
      prompt: "New instructions",
      schedule: "0 4 * * *",
      model: "anthropic/claude-sonnet-5",
      timezone: "America/New_York",
    });
  });

  it("Pause / Resume toggles enabled", async () => {
    render(
      <TaskActions {...edits} isEnabled={false} onDeleteSuccess={vi.fn()} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Resume" }));
    await waitFor(() => expect(updateAction).toHaveBeenCalledTimes(1));
    expect(updateAction.mock.calls[0][0].updates).toEqual({
      id: "task-a",
      enabled: true,
    });
  });

  it("Delete removes the task and reports success to the page", async () => {
    const onDeleteSuccess = vi.fn();
    render(
      <TaskActions {...edits} isEnabled onDeleteSuccess={onDeleteSuccess} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    await waitFor(() => expect(onDeleteSuccess).toHaveBeenCalledTimes(1));
    expect(deleteAction.mock.calls[0][0].actionId).toBe("task-a");
  });
});
