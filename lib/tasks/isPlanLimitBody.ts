import type { PlanLimitBody } from "@/lib/tasks/planLimitBody";

const LIMITS = new Set(["task_count", "min_cadence"]);
const PLANS = new Set(["free", "starter", "pro"]);

/** Whether a 402 body is the documented `plan_limit` shape; anything else keeps the generic error path. */
export function isPlanLimitBody(body: unknown): body is PlanLimitBody {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    b.error === "plan_limit" &&
    typeof b.limit === "string" &&
    LIMITS.has(b.limit) &&
    typeof b.plan === "string" &&
    PLANS.has(b.plan) &&
    typeof b.message === "string" &&
    typeof b.min_cadence_minutes === "number" &&
    typeof b.current_task_count === "number" &&
    (b.task_limit === null || typeof b.task_limit === "number")
  );
}
