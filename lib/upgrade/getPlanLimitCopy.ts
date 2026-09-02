import { formatCadence } from "@/lib/upgrade/formatCadence";
import type { PlanLimitBody } from "@/lib/tasks/planLimitBody";
import type { UpgradeCopy } from "@/lib/upgrade/types";

const PLAN_NAMES = { free: "Free", starter: "Starter", pro: "Pro" } as const;

/**
 * Prompt content for a task-cap or cadence 402: the limit the customer hit
 * is the headline, so the prompt reads as a consequence and not as an ad.
 */
export function getPlanLimitCopy(body: PlanLimitBody): UpgradeCopy {
  const plan = PLAN_NAMES[body.plan];

  if (body.limit === "task_count") {
    const limit = body.task_limit ?? 0;
    const running = limit === 1 ? "it is already running" : "they are already running";
    return {
      headline: `${body.current_task_count} of ${limit} tasks`,
      sub: `on the ${plan} plan`,
      ratio: limit > 0 ? Math.min(1, body.current_task_count / limit) : 1,
      body: `${plan} includes ${limit} ${limit === 1 ? "task" : "tasks"} and ${running}. Upgrading lets you add more and run them more often.`,
    };
  }

  const cadence = formatCadence(body.min_cadence_minutes);
  return {
    headline: cadence.charAt(0).toUpperCase() + cadence.slice(1),
    sub: `fastest on the ${plan} plan`,
    ratio: 1,
    body: `This schedule runs more often than ${plan} allows. Upgrading lets you run it as often as you need.`,
  };
}
