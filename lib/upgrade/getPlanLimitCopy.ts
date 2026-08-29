import { formatCadence } from "@/lib/upgrade/formatCadence";
import type { PlanLimitBody } from "@/lib/tasks/planLimitBody";
import type { UpgradeCopy } from "@/lib/upgrade/types";

const PLAN_NAMES = { free: "Free", starter: "Starter", pro: "Pro" } as const;

/**
 * Prompt copy for a task-cap or cadence 402, built from the numbers in the
 * body so the customer reads the exact limit they hit and the plan that
 * lifts it. A Starter account is pointed at Pro only.
 */
export function getPlanLimitCopy(body: PlanLimitBody): UpgradeCopy {
  const plan = PLAN_NAMES[body.plan];
  const nextSteps =
    body.plan === "free"
      ? "Starter includes 3 tasks, daily at the fastest. Pro is unlimited, hourly at the fastest."
      : "Pro is unlimited, hourly at the fastest.";

  if (body.limit === "task_count") {
    const limit = body.task_limit ?? 0;
    const noun = limit === 1 ? "task" : "tasks";
    return {
      title: `${plan} includes ${limit} ${noun}`,
      body: `You already have ${body.current_task_count} running. ${nextSteps}`,
    };
  }

  return {
    title: `${plan} runs ${formatCadence(body.min_cadence_minutes)} at the fastest`,
    body: `This schedule runs more often than ${plan} allows. ${nextSteps}`,
  };
}
