import { describe, expect, it } from "vitest";
import { getPlanLimitCopy } from "@/lib/upgrade/getPlanLimitCopy";

const base = {
  status: "error" as const,
  error: "plan_limit" as const,
  message: "api message",
  plan: "free" as const,
  task_limit: 1,
  min_cadence_minutes: 10080,
  current_task_count: 1,
  billingUrl: "https://app.recoupable.dev",
};

describe("getPlanLimitCopy", () => {
  it("task_count leads with tasks in use of the cap, meter full", () => {
    const copy = getPlanLimitCopy({ ...base, limit: "task_count" });
    expect(copy.headline).toBe("1 of 1 tasks");
    expect(copy.sub).toBe("on the Free plan");
    expect(copy.ratio).toBe(1);
    expect(copy.body).toBe("Free includes 1 task and it is already running. Upgrading lets you add more and run them more often.");
  });

  it("task_count on Starter pluralises and names the plan", () => {
    const copy = getPlanLimitCopy({ ...base, plan: "starter", limit: "task_count", task_limit: 3, current_task_count: 3, min_cadence_minutes: 1440 });
    expect(copy.headline).toBe("3 of 3 tasks");
    expect(copy.sub).toBe("on the Starter plan");
    expect(copy.body).toBe("Starter includes 3 tasks and they are already running. Upgrading lets you add more and run them more often.");
  });

  it("min_cadence leads with the plan's fastest cadence in words", () => {
    const copy = getPlanLimitCopy({ ...base, limit: "min_cadence", current_task_count: 0 });
    expect(copy.headline).toBe("Weekly");
    expect(copy.sub).toBe("fastest on the Free plan");
    expect(copy.ratio).toBe(1);
    expect(copy.body).toBe("This schedule runs more often than Free allows. Upgrading lets you run it as often as you need.");
  });

  it("never uses em or en dashes", () => {
    for (const limit of ["task_count", "min_cadence"] as const) {
      const copy = getPlanLimitCopy({ ...base, limit });
      expect(`${copy.headline}${copy.sub}${copy.body}`).not.toMatch(/[–—]/);
    }
  });
});
