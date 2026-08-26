import { describe, expect, it } from "vitest";
import { getTaskNextRun } from "@/lib/tasks/getTaskNextRun";

// `upcoming` is Trigger.dev's live list and the only source of run timing
// (chat#2006 item 7); before the first run api#859 seeds it from the schedule.
describe("getTaskNextRun", () => {
  it("uses the first upcoming Trigger fire", () => {
    expect(
      getTaskNextRun({
        upcoming: ["2026-08-31T14:00:00Z", "2026-09-07T14:00:00Z"],
      }),
    ).toBe("2026-08-31T14:00:00Z");
  });

  it("is null when Trigger has no upcoming fire (paused task, or no schedule)", () => {
    expect(getTaskNextRun({ upcoming: [] })).toBeNull();
    expect(getTaskNextRun({})).toBeNull();
  });
});
