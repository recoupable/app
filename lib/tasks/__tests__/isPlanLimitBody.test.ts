import { describe, expect, it } from "vitest";
import { isPlanLimitBody } from "@/lib/tasks/isPlanLimitBody";

const body = {
  status: "error",
  error: "plan_limit",
  limit: "task_count",
  message: "m",
  plan: "free",
  task_limit: 1,
  min_cadence_minutes: 10080,
  current_task_count: 1,
  billingUrl: "https://app.recoupable.dev",
};

describe("isPlanLimitBody", () => {
  it("accepts the documented body, with a null task_limit for Pro", () => {
    expect(isPlanLimitBody(body)).toBe(true);
    expect(isPlanLimitBody({ ...body, plan: "pro", task_limit: null })).toBe(true);
  });

  it("rejects an off-contract body so the modal never renders broken copy", () => {
    expect(isPlanLimitBody({ ...body, limit: "something_else" })).toBe(false);
    expect(isPlanLimitBody({ ...body, plan: "enterprise" })).toBe(false);
    expect(isPlanLimitBody({ ...body, min_cadence_minutes: "60" })).toBe(false);
    expect(isPlanLimitBody({ error: "insufficient_credits" })).toBe(false);
    expect(isPlanLimitBody(null)).toBe(false);
  });
});
