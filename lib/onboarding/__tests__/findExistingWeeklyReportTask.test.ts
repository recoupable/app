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

  it("ignores disabled tasks — a paused schedule is not an active report", () => {
    expect(findExistingWeeklyReportTask([task({ enabled: false })])).toBeNull();
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
