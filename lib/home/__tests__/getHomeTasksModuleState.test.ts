import { describe, expect, it } from "vitest";
import { getHomeTasksModuleState } from "@/lib/home/getHomeTasksModuleState";
import type { TaskRunItem } from "@/lib/tasks/getTaskRuns";
import type { Task } from "@/lib/tasks/getTasks";

const makeRun = (id: string): TaskRunItem => ({
  id,
  status: "COMPLETED",
  taskIdentifier: "customer-prompt-task",
  createdAt: "2026-07-06T09:00:00Z",
  startedAt: "2026-07-06T09:00:01Z",
  finishedAt: "2026-07-06T09:05:00Z",
  durationMs: 299000,
});

const existingTask = {
  id: "task-1",
  title: "Weekly Catalog Report: Luh Tyler",
  schedule: "0 9 * * 1",
  enabled: true,
} as Task;

const fresh = {
  runs: [] as TaskRunItem[],
  runsFailed: false,
  isLoading: false,
  hasArtist: true,
  existingTask: null,
};

describe("getHomeTasksModuleState", () => {
  it("hides the module while runs or tasks are loading", () => {
    expect(getHomeTasksModuleState({ ...fresh, isLoading: true })).toEqual({
      view: "hidden",
    });
  });

  it("hides the module when the runs request failed", () => {
    expect(getHomeTasksModuleState({ ...fresh, runsFailed: true })).toEqual({
      view: "hidden",
    });
  });

  it("shows recent runs when the account has task history", () => {
    const runs = ["a", "b", "c"].map(makeRun);
    expect(getHomeTasksModuleState({ ...fresh, runs })).toEqual({
      view: "runs",
      runs,
    });
  });

  it("caps the module at five runs", () => {
    const runs = ["a", "b", "c", "d", "e", "f", "g"].map(makeRun);
    expect(getHomeTasksModuleState({ ...fresh, runs })).toEqual({
      view: "runs",
      runs: runs.slice(0, 5),
    });
  });

  it("offers the starter task to a fresh account with an artist and no enabled task", () => {
    expect(getHomeTasksModuleState(fresh)).toEqual({ view: "starter" });
  });

  it("shows the existing schedule instead of the starter when a task is already enabled", () => {
    // A user who just finished /setup has a task but no runs until Monday;
    // offering the starter again would schedule a duplicate (chat#2006).
    expect(getHomeTasksModuleState({ ...fresh, existingTask })).toEqual({
      view: "scheduled",
      task: existingTask,
    });
  });

  it("hides the starter when the task list is unknown (request failed)", () => {
    expect(
      getHomeTasksModuleState({ ...fresh, existingTask: undefined }),
    ).toEqual({ view: "hidden" });
  });

  it("hides the starter card when no artist is selected", () => {
    expect(getHomeTasksModuleState({ ...fresh, hasArtist: false })).toEqual({
      view: "hidden",
    });
  });
});
