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
  it("task_count names the cap and what each plan allows", () => {
    const copy = getPlanLimitCopy({ ...base, limit: "task_count" });
    expect(copy.title).toMatch(/1 task/);
    expect(copy.body).toMatch(/Starter/);
    expect(copy.body).toMatch(/Pro/);
  });

  it("min_cadence names the plan's fastest cadence in words", () => {
    const copy = getPlanLimitCopy({ ...base, limit: "min_cadence" });
    expect(copy.title.toLowerCase()).toMatch(/weekly/);
    expect(copy.body).toMatch(/daily/i);
    expect(copy.body).toMatch(/hourly/i);
  });

  it("a Starter account is told Pro is the next step, not Starter", () => {
    const copy = getPlanLimitCopy({ ...base, plan: "starter", limit: "task_count", task_limit: 3, min_cadence_minutes: 1440 });
    expect(copy.title).toMatch(/3 tasks/);
    expect(copy.body).not.toMatch(/Starter includes/);
  });

  it("never uses em or en dashes", () => {
    for (const limit of ["task_count", "min_cadence"] as const) {
      const copy = getPlanLimitCopy({ ...base, limit });
      expect(`${copy.title}${copy.body}`).not.toMatch(/[–—]/);
    }
  });
});
