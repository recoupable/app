import { describe, it, expect } from "vitest";
import { describeNextRun } from "@/lib/tasks/describeNextRun";

describe("describeNextRun", () => {
  it("prefers a concrete upcoming timestamp when Trigger supplied one", () => {
    const result = describeNextRun({
      schedule: "0 10 * * 1",
      upcoming: ["2026-08-03T14:00:00.000Z"],
    });
    expect(result.kind).toBe("timestamp");
    expect(result.value).toContain("2026");
  });

  // The regression this exists for (chat#1918): an empty `upcoming` is common on a
  // perfectly live schedule, and "No runs yet" read as though nothing was set up.
  it("falls back to the cron description when upcoming is empty", () => {
    const result = describeNextRun({ schedule: "0 10 * * 1", upcoming: [] });
    expect(result.kind).toBe("cron");
    expect(result.value).toMatch(/Monday/i);
  });

  it("falls back to the cron description when upcoming is undefined", () => {
    const result = describeNextRun({ schedule: "0 9 * * *" });
    expect(result.kind).toBe("cron");
    expect(result.value).toMatch(/09:00|9:00/);
  });

  it("returns kind 'unknown' when the cron cannot be parsed and there is no upcoming", () => {
    const result = describeNextRun({ schedule: "not-a-cron", upcoming: [] });
    expect(result.kind).toBe("unknown");
    expect(result.value).toBeNull();
  });

  it("returns kind 'unknown' when there is no schedule at all", () => {
    const result = describeNextRun({ schedule: null, upcoming: [] });
    expect(result.kind).toBe("unknown");
  });

  it("ignores a malformed upcoming entry and falls back to the cron", () => {
    const result = describeNextRun({ schedule: "0 10 * * 1", upcoming: ["not-a-date"] });
    expect(result.kind).toBe("cron");
  });
});
