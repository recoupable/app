import { describe, it, expect } from "vitest";
import { getTaskState } from "@/lib/projects/getTaskState";
import type { ProjectTask } from "@/lib/projects/types";

const task = (over: Partial<ProjectTask> = {}): ProjectTask => ({
  id: "t1",
  project_id: "p1",
  title: "Distribution portal access",
  description: null,
  due_date: null,
  assignee_account_id: null,
  completed_at: null,
  completed_by: null,
  created_at: "2026-08-31T00:00:00Z",
  ...over,
});

describe("getTaskState", () => {
  it("is completed once completed_at is set, whoever it is assigned to", () => {
    const state = getTaskState(task({ completed_at: "2026-08-31T00:00:00Z", assignee_account_id: "me" }), "me");
    expect(state.isComplete).toBe(true);
    expect(state.needsYou).toBe(false);
  });

  it("needs you when an open task is assigned to the viewer", () => {
    expect(getTaskState(task({ assignee_account_id: "me" }), "me").needsYou).toBe(true);
  });

  it("does not need you when the task is assigned to someone else", () => {
    expect(getTaskState(task({ assignee_account_id: "them" }), "me").needsYou).toBe(false);
  });

  it("does not need you when nobody is assigned, or nobody is signed in", () => {
    expect(getTaskState(task(), "me").needsYou).toBe(false);
    expect(getTaskState(task({ assignee_account_id: "me" }), null).needsYou).toBe(false);
  });
});
