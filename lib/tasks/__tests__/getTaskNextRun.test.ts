import { describe, expect, it } from "vitest";
import { getTaskNextRun } from "@/lib/tasks/getTaskNextRun";

// `upcoming` is the Trigger.dev schedule's live list. `scheduled_actions.next_run`
// is a legacy column nothing has written since the Trigger.dev migration
// (2025-11-04): 58 of 164 rows carry stale 2025 values, so it must never win
// over `upcoming` (chat#2006 item 6).
describe("getTaskNextRun", () => {
  it("uses the first upcoming Trigger fire", () => {
    expect(
      getTaskNextRun({
        next_run: null,
        upcoming: ["2026-08-31T14:00:00Z", "2026-09-07T14:00:00Z"],
      }),
    ).toBe("2026-08-31T14:00:00Z");
  });

  it("prefers upcoming over a stale legacy next_run", () => {
    expect(
      getTaskNextRun({
        next_run: "2025-10-21T00:00:00Z",
        upcoming: ["2026-08-31T14:00:00Z"],
      }),
    ).toBe("2026-08-31T14:00:00Z");
  });

  it("is null when Trigger has no upcoming fire, even if a legacy next_run exists", () => {
    expect(
      getTaskNextRun({ next_run: "2025-10-21T00:00:00Z", upcoming: [] }),
    ).toBeNull();
    expect(getTaskNextRun({ next_run: null })).toBeNull();
  });
});
