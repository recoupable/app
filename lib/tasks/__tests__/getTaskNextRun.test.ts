import { describe, expect, it } from "vitest";
import { getTaskNextRun } from "@/lib/tasks/getTaskNextRun";

// `scheduled_actions.next_run` is null until a task's first fire, while
// Trigger's `upcoming` (enriched by GET /api/tasks) already knows the real
// time. A fresh task must never read "Never" (chat#2006 item 6).
describe("getTaskNextRun", () => {
  it("prefers the persisted next_run", () => {
    expect(
      getTaskNextRun({
        next_run: "2026-08-31T14:00:00Z",
        upcoming: ["2026-09-07T14:00:00Z"],
      }),
    ).toBe("2026-08-31T14:00:00Z");
  });

  it("falls back to the first upcoming Trigger fire when next_run is null", () => {
    expect(
      getTaskNextRun({
        next_run: null,
        upcoming: ["2026-08-31T14:00:00Z", "2026-09-07T14:00:00Z"],
      }),
    ).toBe("2026-08-31T14:00:00Z");
  });

  it("is null when neither is known", () => {
    expect(getTaskNextRun({ next_run: null, upcoming: [] })).toBeNull();
    expect(getTaskNextRun({ next_run: null })).toBeNull();
  });
});
