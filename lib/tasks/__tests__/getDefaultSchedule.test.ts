import { describe, expect, it } from "vitest";
import { getDefaultSchedule } from "@/lib/tasks/getDefaultSchedule";

describe("getDefaultSchedule", () => {
  it("is weekly when the plan's fastest cadence is weekly", () => {
    expect(getDefaultSchedule(10080)).toBe("0 9 * * 1");
  });
  it("is daily when the plan allows daily or faster", () => {
    expect(getDefaultSchedule(1440)).toBe("0 9 * * *");
    expect(getDefaultSchedule(60)).toBe("0 9 * * *");
  });
  it("is daily when the api does not report a cadence (today's api)", () => {
    expect(getDefaultSchedule(undefined)).toBe("0 9 * * *");
  });
});
