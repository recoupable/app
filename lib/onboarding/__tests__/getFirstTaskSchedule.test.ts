import { describe, expect, it, vi } from "vitest";
import { getFirstTaskSchedule } from "@/lib/onboarding/getFirstTaskSchedule";
import { getCronHumanPreview } from "@/lib/tasks/getCronHumanPreview";

// Monthly, anchored to the moment the task is created (recoupable/app#1941,
// Sweets 2026-08-06): created the 14th at 15:20 → runs the 14th at 15:20.
describe("getFirstTaskSchedule", () => {
  it("runs monthly on the creation date and time", () => {
    expect(getFirstTaskSchedule(new Date(2026, 7, 14, 15, 20))).toBe(
      "20 15 14 * *",
    );
  });

  it("moves the 29th-31st to the 28th so the report runs every month", () => {
    expect(getFirstTaskSchedule(new Date(2026, 0, 31, 9, 5))).toBe(
      "5 9 28 * *",
    );
    expect(getFirstTaskSchedule(new Date(2026, 3, 29, 0, 0))).toBe(
      "0 0 28 * *",
    );
  });

  // With no browser timezone the API reads the cron in UTC, so build it in UTC.
  it("uses UTC fields when asked", () => {
    expect(
      getFirstTaskSchedule(new Date(Date.UTC(2026, 7, 31, 23, 45)), {
        utc: true,
      }),
    ).toBe("45 23 28 * *");
  });

  it("defaults to now", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 7, 8, 30));
    expect(getFirstTaskSchedule()).toBe("30 8 7 * *");
    vi.useRealTimers();
  });

  it("is a valid cron the existing human-preview helper can describe", () => {
    const preview = getCronHumanPreview(
      getFirstTaskSchedule(new Date(2026, 7, 14, 15, 20)),
    );
    expect(preview).toBe("At 03:20 PM, on day 14 of the month");
  });
});
