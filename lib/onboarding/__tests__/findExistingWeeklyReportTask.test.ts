import { describe, expect, it } from "vitest";
import { findExistingWeeklyReportTask } from "@/lib/onboarding/findExistingWeeklyReportTask";
import type { Task } from "@/lib/tasks/getTasks";

const task = (over: Partial<Task>): Task =>
  ({ id: "t1", enabled: true, title: "Weekly report", ...over }) as Task;

describe("findExistingWeeklyReportTask", () => {
  it("returns the enabled task so setup can show it instead of scheduling a duplicate", () => {
    const existing = task({ id: "abc" });

    expect(findExistingWeeklyReportTask([existing])?.id).toBe("abc");
  });

  // "Turn off" pauses the auto-created report (recoupable/app#1941); setup
  // must show it rather than pre-run and create another one.
  it("falls back to a paused task so a turned-off report is not recreated", () => {
    expect(
      findExistingWeeklyReportTask([task({ id: "off", enabled: false })])?.id,
    ).toBe("off");
  });

  it("returns null for an empty or missing list, so first-run still pre-runs", () => {
    expect(findExistingWeeklyReportTask([])).toBeNull();
    expect(findExistingWeeklyReportTask(undefined)).toBeNull();
  });

  it("prefers the first enabled task when several exist", () => {
    const tasks = [
      task({ id: "off", enabled: false }),
      task({ id: "on-1" }),
      task({ id: "on-2" }),
    ];

    expect(findExistingWeeklyReportTask(tasks)?.id).toBe("on-1");
  });
});
