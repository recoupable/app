import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTask } from "@/lib/tasks/createTask";
import { updateTask } from "@/lib/tasks/updateTask";
import { PlanLimitError } from "@/lib/tasks/planLimitError";

const body = JSON.stringify({
  status: "error",
  error: "plan_limit",
  limit: "min_cadence",
  message: "Free runs weekly at the fastest.",
  plan: "free",
  task_limit: 1,
  min_cadence_minutes: 10080,
  current_task_count: 0,
  billingUrl: "https://app.recoupable.dev",
});

describe("task writes on a 402 plan_limit", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 402, text: async () => body }));
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => vi.unstubAllGlobals());

  it("createTask throws the typed error, not a generic HTTP string", async () => {
    await expect(
      createTask("t", { title: "a", prompt: "b", schedule: "* * * * *", artist_account_id: "x" }),
    ).rejects.toBeInstanceOf(PlanLimitError);
  });

  it("updateTask throws the typed error too", async () => {
    await expect(updateTask("t", { id: "task-1", schedule: "* * * * *" })).rejects.toBeInstanceOf(
      PlanLimitError,
    );
  });
});
