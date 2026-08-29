import type { PlanLimitBody } from "@/lib/tasks/planLimitBody";
import { PlanLimitError } from "@/lib/tasks/planLimitError";

/**
 * Turns the documented 402 `plan_limit` body into a typed error so callers
 * can open the upgrade prompt. Every other failure keeps its generic path.
 *
 * @param status - HTTP status of the task write.
 * @param text - Raw response body.
 */
export function throwIfPlanLimit(status: number, text: string): void {
  if (status !== 402) return;
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return;
  }
  if (body && typeof body === "object" && (body as PlanLimitBody).error === "plan_limit") {
    throw new PlanLimitError(body as PlanLimitBody);
  }
}
