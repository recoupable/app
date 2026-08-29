import { isPlanLimitBody } from "@/lib/tasks/isPlanLimitBody";
import { PlanLimitError } from "@/lib/tasks/planLimitError";

/**
 * Turns the documented 402 `plan_limit` body into a typed error so callers
 * can open the upgrade prompt. Every other failure, including an
 * off-contract 402, keeps its generic path.
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
  if (isPlanLimitBody(body)) {
    throw new PlanLimitError(body);
  }
}
