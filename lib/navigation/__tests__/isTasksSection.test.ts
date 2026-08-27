import { describe, expect, it } from "vitest";
import { isTasksSection } from "@/lib/navigation/isTasksSection";

// The sidebar's Tasks item must stay lit on run pages once runs live at
// /runs/{runId} (chat#2006 item 2).
describe("isTasksSection", () => {
  it("is true for the tasks list and a task page", () => {
    expect(isTasksSection("/tasks")).toBe(true);
    expect(isTasksSection("/tasks/a390e634-c717-4c96-a9a2-4be36f404363")).toBe(
      true,
    );
  });

  it("is true for a run page", () => {
    expect(isTasksSection("/runs/run_06g3i0e3logru439uh9e1m8801")).toBe(true);
  });

  it("is false elsewhere", () => {
    expect(isTasksSection("/")).toBe(false);
    expect(isTasksSection("/agents")).toBe(false);
    expect(isTasksSection("/artists/abc")).toBe(false);
  });
});
