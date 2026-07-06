import { describe, expect, it } from "vitest";
import { getHomeTasksModuleState } from "@/lib/home/getHomeTasksModuleState";
import type { TaskRunItem } from "@/lib/tasks/getTaskRuns";

const makeRun = (id: string): TaskRunItem => ({
  id,
  status: "COMPLETED",
  taskIdentifier: "customer-prompt-task",
  createdAt: "2026-07-06T09:00:00Z",
  startedAt: "2026-07-06T09:00:01Z",
  finishedAt: "2026-07-06T09:05:00Z",
  durationMs: 299000,
});

describe("getHomeTasksModuleState", () => {
  it("hides the module while runs are loading", () => {
    expect(
      getHomeTasksModuleState({
        runs: undefined,
        runsFailed: false,
        isLoading: true,
        hasArtist: true,
      }),
    ).toEqual({ view: "hidden" });
  });

  it("hides the module when the runs request failed", () => {
    expect(
      getHomeTasksModuleState({
        runs: undefined,
        runsFailed: true,
        isLoading: false,
        hasArtist: true,
      }),
    ).toEqual({ view: "hidden" });
  });

  it("shows recent runs when the account has task history", () => {
    const runs = ["a", "b", "c"].map(makeRun);
    expect(
      getHomeTasksModuleState({
        runs,
        runsFailed: false,
        isLoading: false,
        hasArtist: true,
      }),
    ).toEqual({ view: "runs", runs });
  });

  it("caps the module at five runs", () => {
    const runs = ["a", "b", "c", "d", "e", "f", "g"].map(makeRun);
    const state = getHomeTasksModuleState({
      runs,
      runsFailed: false,
      isLoading: false,
      hasArtist: true,
    });
    expect(state).toEqual({ view: "runs", runs: runs.slice(0, 5) });
  });

  it("offers the starter task to a fresh account with an artist", () => {
    expect(
      getHomeTasksModuleState({
        runs: [],
        runsFailed: false,
        isLoading: false,
        hasArtist: true,
      }),
    ).toEqual({ view: "starter" });
  });

  it("hides the starter card when no artist is selected", () => {
    expect(
      getHomeTasksModuleState({
        runs: [],
        runsFailed: false,
        isLoading: false,
        hasArtist: false,
      }),
    ).toEqual({ view: "hidden" });
  });
});
