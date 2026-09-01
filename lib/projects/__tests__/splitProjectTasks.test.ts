import { describe, it, expect } from "vitest";
import { splitProjectTasks } from "@/lib/projects/splitProjectTasks";
import type { ProjectTask } from "@/lib/projects/types";

const task = (id: string, over: Partial<ProjectTask> = {}): ProjectTask => ({
  id,
  project_id: "p1",
  title: id,
  created_at: "2026-08-31T00:00:00Z",
  ...over,
});

describe("splitProjectTasks", () => {
  it("pins the viewer's open tasks, keeps the rest in order, and sets completed aside", () => {
    const split = splitProjectTasks(
      [
        task("ours"),
        task("yours", { assignee_account_id: "me" }),
        task("done", { completed_at: "2026-08-31T00:00:00Z" }),
        task("later"),
      ],
      "me",
    );

    expect(split.needsYou.map((t) => t.id)).toEqual(["yours"]);
    expect(split.active.map((t) => t.id)).toEqual(["ours", "later"]);
    expect(split.completed.map((t) => t.id)).toEqual(["done"]);
  });

  it("never pins a completed task, even one assigned to the viewer", () => {
    const split = splitProjectTasks(
      [task("done", { assignee_account_id: "me", completed_at: "2026-08-31T00:00:00Z" })],
      "me",
    );
    expect(split.needsYou).toEqual([]);
    expect(split.completed.map((t) => t.id)).toEqual(["done"]);
  });

  it("pins nothing when nobody is signed in", () => {
    const split = splitProjectTasks([task("yours", { assignee_account_id: "me" })], null);
    expect(split.needsYou).toEqual([]);
    expect(split.active.map((t) => t.id)).toEqual(["yours"]);
  });
});
