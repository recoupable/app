import { describe, expect, it } from "vitest";
import { isTaskId } from "@/lib/tasks/isTaskId";

// /tasks/{param} serves both id spaces: scheduled_actions ids are UUIDs,
// Trigger.dev run ids are `run_`-prefixed (chat#2006 item 2).
describe("isTaskId", () => {
  it("accepts a scheduled_actions UUID", () => {
    expect(isTaskId("a390e634-c717-4c96-a9a2-4be36f404363")).toBe(true);
    expect(isTaskId("A390E634-C717-4C96-A9A2-4BE36F404363")).toBe(true);
  });

  it("rejects a Trigger.dev run id", () => {
    expect(isTaskId("run_06g3i0e3logru439uh9e1m8801")).toBe(false);
  });

  it("rejects junk", () => {
    expect(isTaskId("")).toBe(false);
    expect(isTaskId("not-a-uuid")).toBe(false);
    expect(isTaskId("a390e634-c717-4c96-a9a2-4be36f40436")).toBe(false);
  });
});
