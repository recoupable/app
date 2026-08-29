import type { PlanLimitBody } from "@/lib/tasks/planLimitBody";

/** A task write the api refused because the plan's cap was hit; carries the 402 body. */
export class PlanLimitError extends Error {
  readonly body: PlanLimitBody;

  constructor(body: PlanLimitBody) {
    super(body.message);
    this.name = "PlanLimitError";
    this.body = body;
  }
}
