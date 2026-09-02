import { describe, expect, it } from "vitest";
import { throwIfPlanLimit } from "@/lib/tasks/throwIfPlanLimit";
import { PlanLimitError } from "@/lib/tasks/planLimitError";

const body = {
  status: "error",
  error: "plan_limit",
  limit: "task_count",
  message: "Free includes 1 task. Starter includes 3, Pro is unlimited.",
  plan: "free",
  task_limit: 1,
  min_cadence_minutes: 10080,
  current_task_count: 1,
  billingUrl: "https://app.recoupable.dev",
};

describe("throwIfPlanLimit", () => {
  it("throws a PlanLimitError carrying the documented 402 body", () => {
    expect(() => throwIfPlanLimit(402, JSON.stringify(body))).toThrow(PlanLimitError);
    try {
      throwIfPlanLimit(402, JSON.stringify(body));
    } catch (error) {
      expect((error as PlanLimitError).body).toEqual(body);
    }
  });

  it("ignores other statuses and other 402s, which keep their generic handling", () => {
    expect(() => throwIfPlanLimit(400, JSON.stringify(body))).not.toThrow();
    expect(() =>
      throwIfPlanLimit(402, JSON.stringify({ error: "insufficient_credits" })),
    ).not.toThrow();
    expect(() => throwIfPlanLimit(402, "not json")).not.toThrow();
  });
});
