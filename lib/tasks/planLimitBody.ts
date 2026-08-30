/** The 402 body `POST`/`PATCH /api/tasks` return when a plan cap is hit (app#2044 row 2). */
export interface PlanLimitBody {
  status: "error";
  error: "plan_limit";
  limit: "task_count" | "min_cadence";
  message: string;
  plan: "free" | "starter" | "pro";
  task_limit: number | null;
  min_cadence_minutes: number;
  current_task_count: number;
  billingUrl: string;
}
